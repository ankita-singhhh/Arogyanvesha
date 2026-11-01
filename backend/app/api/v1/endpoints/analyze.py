import time

from fastapi import APIRouter, HTTPException

from app.schemas.analysis import AnalysisRequest, AnalysisResponse, WellnessCard
from app.schemas.symptom import SymptomExtractRequest
from app.schemas.rag import RAGQueryRequest

from app.services.safety_service import SafetyService
from app.services.symptom_extractor import SymptomExtractor
from app.services.rag_service import RAGService
from app.services.gemini_service import (
    GeminiService,
    CARD_CATEGORY_META,
    REQUIRED_CARD_COUNT,
    get_fallback_wellness_cards,
)

from app.core.logging import logger


router = APIRouter()


CANDIDATE_DISCLAIMER = (
    "These are AI-generated possibilities based on the symptoms you described. They are not "
    "diagnoses, are not medically verified, and may be inaccurate. Only a qualified clinician "
    "can determine the cause."
)
SYNTHESIS_EMERGENCY_MESSAGE = (
    "Your symptoms may indicate an urgent medical emergency. Please seek immediate "
    "emergency medical assessment (call 112 in India, 911 in the US)."
)


def _deduplicate_passages(passages):
    """Keep unique passages so the model and UI do not repeat evidence."""
    seen = set()
    unique = []
    for passage in passages:
        key = (passage.document_id, " ".join(passage.content.split()).lower())
        if key not in seen:
            unique.append(passage)
            seen.add(key)
    return unique


def _retrieve_grounding_passages(rag_service, query, conditions):
    """Retrieve category-specific wellness evidence plus separate safety evidence.

    A single top-k search was routinely dominated by generic warnings, leaving
    Gemini with no usable support for the distinct wellness categories.
    """
    category_groups = (
        ("food",),
        ("traditional_options", "complementary_options"),
        ("lifestyle", "home_support"),
        ("yoga", "yoga_safety"),
        ("ayurvedic_perspective", "prakriti"),
        ("precautions", "warning_signs", "when_to_seek_care", "evidence"),
    )
    passages = []
    for categories in category_groups:
        result = rag_service.query(RAGQueryRequest(
            query=query,
            conditions=conditions,
            categories=list(categories),
            top_k=3,
        ))
        passages.extend(result.passages or [])
    return _deduplicate_passages(passages)


def _passages_by_identifier(retrieved_passages):
    """Map document_id and source_id aliases to the retrieved passage.

    Some indexes expose the registered source-document ID as source_id while
    Gemini sees the RAG document_id. Both aliases resolve only to a passage
    that was actually retrieved, preserving grounding without false rejects.
    """
    passages_by_id = {}
    for passage in retrieved_passages:
        for identifier in (passage.document_id, passage.source_id):
            normalized = str(identifier or "").strip()
            if normalized:
                passages_by_id[normalized] = passage
    return passages_by_id


def _build_wellness_cards(retrieved_passages, generated_cards):
    """Turn the validated generated cards into response cards.

    Cards are general traditional wellness education. A citation is attached only
    when it resolves to a source-grounded passage that was actually retrieved, so
    a card with no valid citation is shown without a source rather than with an
    invented one. (evidence_status keeps its existing values: "supported" when a
    source is attached, otherwise "unavailable".)
    """
    passages_by_id = _passages_by_identifier(_deduplicate_passages(retrieved_passages))
    cards = []
    for index, generated in enumerate(generated_cards, start=1):
        category = generated["category"]
        meta = CARD_CATEGORY_META[category]
        cited_passages = []
        seen = set()
        for doc_id in generated.get("citation_document_ids") or []:
            passage = passages_by_id.get(str(doc_id).strip())
            if not passage or not passage.source_grounded:
                continue
            if str(passage.document_id) in seen:
                continue
            seen.add(str(passage.document_id))
            cited_passages.append(passage)
        citations = list(dict.fromkeys(p.source_name for p in cited_passages if p.source_name))
        urls = list(dict.fromkeys(p.url for p in cited_passages if p.url))
        cards.append(WellnessCard(
            id=f"{meta['slug']}_{index}",
            title=generated["title"],
            icon=meta["icon"],
            category=category,
            recommendation=generated["recommendation"],
            ayurvedic_context=generated["ayurvedic_context"],
            safety_precautions=generated["safety_precautions"],
            details=generated["ayurvedic_context"],
            evidence_status="supported" if citations else "unavailable",
            citations=citations,
            citation_urls=urls,
        ))
    return cards


def _ayurvedic_citations(retrieved_passages, document_ids):
    """Resolve only grounded Ayurvedic-perspective citations returned by Gemini.

    Accepts the same document_id / source_id aliases as the wellness cards.
    """
    passages_by_id = _passages_by_identifier(retrieved_passages)
    passages = []
    seen = set()
    for document_id in (document_ids or []):
        passage = passages_by_id.get(str(document_id).strip())
        if not passage or str(passage.document_id) in seen:
            continue
        if passage.source_grounded and passage.category in {"ayurvedic_perspective", "prakriti"}:
            passages.append(passage)
            seen.add(str(passage.document_id))
    return (
        list(dict.fromkeys(passage.source_name for passage in passages if passage.source_name)),
        list(dict.fromkeys(passage.url for passage in passages if passage.url)),
    )


def _log_step_timing(step: str, started_at: float, **metrics):
    """Log performance metadata only; never include symptom input or profiles."""
    logger.info(
        "Analysis timing step=%s duration_ms=%d metrics=%s",
        step,
        int((time.perf_counter() - started_at) * 1000),
        metrics,
    )


def _emergency_response(symptom_text, emergency_message, vulnerability_alerts):
    """Emergency result: urgent-care guidance only, no routine recommendations."""
    emergency_warnings = ["A potential emergency warning sign was detected."]
    emergency_warnings.extend(vulnerability_alerts)

    return AnalysisResponse(
        status="emergency_alert",
        is_emergency=True,
        emergency_message=emergency_message,
        urgency="emergency",
        original_symptom_text=symptom_text,
        recognized_symptoms=[],
        unmatched_symptoms=[],
        clarification_needed=False,
        clarification_questions=[],
        candidate_conditions=[],
        analysis_source="none",
        dosha_imbalance="Not assessed",
        ayurvedic_explanation=(
            "Wellness guidance must not delay urgent medical care."
        ),
        ayurvedic_citations=[],
        ayurvedic_citation_urls=[],
        evidence_grounded_summary=(
            "A potential emergency warning sign was detected. "
            "This application cannot diagnose or rule out "
            "a medical emergency."
        ),
        retrieved_evidence=[],
        wellness_cards=[],
        recommendations=[
            "Seek emergency medical assessment immediately.",
            "In India, call 112 for emergency assistance.",
            "Do not delay care for Ayurvedic remedies or "
            "machine-learning predictions.",
        ],
        herbs=[],
        lifestyle_guidance=[],
        warning_signs=emergency_warnings,
        when_to_seek_care=(
            "Seek immediate emergency medical assessment."
        ),
    )


@router.post("", response_model=AnalysisResponse)
def analyze_symptoms(request: AnalysisRequest):
    """
    Arogyanvesha symptom analysis pipeline.

    1. Emergency safety check.
    2. Vulnerability assessment using optional age.
    3. Symptom extraction and normalization.
    4. Random Forest candidate ranking (when enough symptoms are recognized).
    5. RAG knowledge retrieval (optional context).
    6. Gemini synthesis producing exactly 5 wellness cards, with fallback handling.

    This endpoint provides informational support, not a diagnosis.
    """

    try:
        request_started_at = time.perf_counter()
        # ---------------------------------------------------------
        # STEP 1: Normalize incoming request
        # ---------------------------------------------------------
        symptom_text = (request.symptom_text or "").strip()
        symptom_chips = request.symptom_chips or []

        combined_text = " ".join(
            item.strip()
            for item in [symptom_text, *symptom_chips]
            if item and item.strip()
        )

        if not combined_text:
            raise HTTPException(
                status_code=422,
                detail="Please describe at least one symptom.",
            )

        # ---------------------------------------------------------
        # STEP 2: Independent emergency safety check
        # ---------------------------------------------------------
        step_started_at = time.perf_counter()
        (
            is_emergency,
            emergency_message,
            safety_urgency,
        ) = SafetyService.evaluate_emergency(combined_text)

        # ---------------------------------------------------------
        # STEP 3: Vulnerability assessment
        # IMPORTANT: Pass request.age to SafetyService.
        # ---------------------------------------------------------
        vulnerability_alerts = (
            SafetyService.evaluate_vulnerability(
                combined_text,
                user_profile={
                    "age": request.age
                } if request.age is not None else None,
            )
        )

        vulnerability_alerts = list(
            vulnerability_alerts or []
        )
        _log_step_timing("safety", step_started_at, emergency=is_emergency, vulnerability_alerts=len(vulnerability_alerts))

        # ---------------------------------------------------------
        # STEP 4: Emergency intercept
        # Must happen before ML, RAG and Gemini inference.
        # ---------------------------------------------------------
        if is_emergency:
            logger.warning(
                "Emergency warning sign detected by SafetyService."
            )
            return _emergency_response(symptom_text, emergency_message, vulnerability_alerts)

        # ---------------------------------------------------------
        # STEP 5: Extract and normalize symptoms
        # ---------------------------------------------------------
        step_started_at = time.perf_counter()
        extractor = SymptomExtractor.get_instance()

        extraction = extractor.extract(
            SymptomExtractRequest(
                text=symptom_text or combined_text,
                language=request.language or "auto",
                existing_chips=symptom_chips,
            )
        )
        _log_step_timing("symptom_extraction", step_started_at, recognized=len(extraction.canonical_symptoms or []))

        canonical_symptoms = list(
            dict.fromkeys(
                extraction.canonical_symptoms or []
            )
        )

        # ---------------------------------------------------------
        # STEP 6: Merge manually selected symptom chips without loading RF.
        step_started_at = time.perf_counter()
        for chip in symptom_chips:
            normalized_chip = chip.strip().lower()
            if normalized_chip and normalized_chip not in canonical_symptoms:
                canonical_symptoms.append(normalized_chip)
        _log_step_timing("symptom_chip_merge", step_started_at, recognized=len(canonical_symptoms))

        unmatched_symptoms = list(
            extraction.uncertain_symptoms or []
        )

        # ---------------------------------------------------------
        # STEP 7: Clarification handling
        # ---------------------------------------------------------
        clarification_needed = bool(
            extraction.requires_clarification
            or not canonical_symptoms
        )

        clarification_questions = (
            list(extraction.clarification_questions or [])
            if clarification_needed
            else []
        )

        candidates = []
        retrieved_passages = []

        # ---------------------------------------------------------
        # STEP 9: RAG knowledge retrieval
        # Optional context: cards are still produced if retrieval fails.
        # ---------------------------------------------------------
        step_started_at = time.perf_counter()
        try:
            retrieved_passages = _retrieve_grounding_passages(
                RAGService.get_instance(),
                symptom_text or " ".join(canonical_symptoms) or combined_text,
                [],
            )
        except Exception:
            logger.exception("RAG retrieval failed; continuing without retrieved passages.")
            retrieved_passages = []
        _log_step_timing("rag_retrieval", step_started_at, passages=len(retrieved_passages))

        # ---------------------------------------------------------
        # STEP 10: Gemini synthesis (always runs for non-emergency input,
        # even when too few symptoms were recognized for model ranking)
        # ---------------------------------------------------------
        step_started_at = time.perf_counter()
        gemini_service = GeminiService.get_instance()

        synthesis = gemini_service.generate_synthesis(
            symptom_text=symptom_text or combined_text,
            recognized_symptoms=canonical_symptoms,
            candidates=[],  # Legacy argument; RF candidates are disabled.
            retrieved_passages=retrieved_passages,
            user_prakriti=request.user_prakriti,
            duration=request.duration,
            severity=request.severity,
            language=request.language or "auto",
            body_areas=request.body_areas,
            age=request.age,
            safety_urgency=safety_urgency,
            safety_alerts=vulnerability_alerts,
        )
        _log_step_timing(
            "wellness_synthesis",
            step_started_at,
            used_fallback=synthesis.get("generated_by") == "fallback",
        )

        candidates = synthesis.get("candidate_conditions") or []

        # ---------------------------------------------------------
        # STEP 11: Validate and merge urgency
        # ---------------------------------------------------------
        allowed_urgencies = {
            "low",
            "medium",
            "high",
            "emergency",
        }

        urgency_priority = {
            "low": 1,
            "medium": 2,
            "high": 3,
            "emergency": 4,
        }

        synthesis_urgency = str(
            synthesis.get("urgency", "low")
        ).strip().lower()

        if synthesis_urgency not in allowed_urgencies:
            logger.warning(
                "Invalid synthesis urgency received; using medium."
            )
            synthesis_urgency = "medium"

        if safety_urgency not in allowed_urgencies:
            safety_urgency = "low"

        # Keep the higher urgency. Gemini cannot downgrade
        # an independently detected safety urgency.
        urgency = max(
            [synthesis_urgency, safety_urgency],
            key=lambda value: urgency_priority[value],
        )

        # Gemini flagged a possible emergency: urgent care replaces routine cards.
        if urgency == "emergency":
            logger.warning("Emergency urgency returned by synthesis; suppressing wellness cards.")
            return _emergency_response(
                symptom_text, SYNTHESIS_EMERGENCY_MESSAGE, vulnerability_alerts
            )

        if clarification_needed and not candidates:
            if urgency == "low":
                urgency = "medium"

        # ---------------------------------------------------------
        # STEP 12: Merge warning signs
        # ---------------------------------------------------------
        warning_signs = list(
            synthesis.get("warning_signs") or []
        )

        for alert in vulnerability_alerts:
            if alert not in warning_signs:
                warning_signs.append(alert)

        # Do not provide individualized herbal treatments.
        herbs = []

        perspective_document_ids = synthesis.get("traditional_perspective_citations") or synthesis.get("ayurvedic_citation_document_ids")
        ayurvedic_citations, ayurvedic_citation_urls = _ayurvedic_citations(
            retrieved_passages,
            perspective_document_ids,
        )
        ayurvedic_explanation = synthesis.get("traditional_perspective") or synthesis.get("ayurvedic_explanation", "")
        if not ayurvedic_citations:
            ayurvedic_explanation = (
                "No source-grounded traditional Ayurvedic perspective was "
                "retrieved for these symptoms."
            )

        # ---------------------------------------------------------
        # STEP 13: Build exactly five wellness cards
        # ---------------------------------------------------------
        step_started_at = time.perf_counter()
        generated_cards = synthesis.get("wellness_cards") or []
        if len(generated_cards) != REQUIRED_CARD_COUNT:
            # Defensive: the service already guarantees this; never ship a partial set.
            logger.warning("Synthesis returned %d cards; using fallback cards.", len(generated_cards))
            generated_cards = get_fallback_wellness_cards()
            synthesis["generated_by"] = "fallback"
        wellness_cards = _build_wellness_cards(retrieved_passages, generated_cards)
        _log_step_timing("wellness_card_construction", step_started_at, cards=len(wellness_cards))

        # ---------------------------------------------------------
        # STEP 14: Log completion
        # ---------------------------------------------------------
        logger.info(
            "Analysis completed: recognized=%d, candidates=%d, "
            "clarification_needed=%s, emergency=%s, age=%s, "
            "vulnerability_alerts=%d",
            len(canonical_symptoms),
            len(candidates),
            clarification_needed,
            False,
            request.age,
            len(vulnerability_alerts),
        )
        _log_step_timing("pipeline_total", request_started_at, outcome="success")

        # ---------------------------------------------------------
        # STEP 15: Build final response
        # ---------------------------------------------------------
        return AnalysisResponse(
            status="success",
            is_emergency=False,
            emergency_message=None,
            urgency=urgency,

            original_symptom_text=symptom_text,

            recognized_symptoms=canonical_symptoms,
            unmatched_symptoms=unmatched_symptoms,

            clarification_needed=clarification_needed,
            clarification_questions=clarification_questions,

            candidate_conditions=candidates,

            symptom_summary=(
                str(synthesis.get("symptom_summary") or "").strip()
                or symptom_text
                or ", ".join(canonical_symptoms)
            ),
            recognized_symptoms_summary=str(synthesis.get("recognized_symptoms_summary") or "").strip(),
            candidate_ranking_explanation=(
                str(synthesis.get("candidate_ranking_explanation") or "").strip()
                if candidates else ""
            ),
            candidate_ranking_disclaimer=CANDIDATE_DISCLAIMER if candidates else "",
            analysis_source=str(synthesis.get("generated_by") or "none"),

            dosha_imbalance=synthesis.get(
                "dosha_imbalance",
                "Not assessed",
            ),

            ayurvedic_explanation=ayurvedic_explanation,
            traditional_perspective=ayurvedic_explanation,
            ayurvedic_citations=ayurvedic_citations,
            ayurvedic_citation_urls=ayurvedic_citation_urls,
            traditional_perspective_citations=ayurvedic_citations,

            evidence_grounded_summary=synthesis.get(
                "evidence_grounded_summary",
                "",
            ),

            retrieved_evidence=retrieved_passages,

            wellness_cards=wellness_cards,

            recommendations=synthesis.get(
                "recommendations",
                [],
            ),

            herbs=herbs,

            lifestyle_guidance=synthesis.get(
                "lifestyle_guidance",
                [],
            ),

            warning_signs=warning_signs,

            when_to_seek_care=synthesis.get(
                "when_to_seek_care",
                "",
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.error(
            "Analysis pipeline error: %s",
            exc,
            exc_info=True,
        )

        raise HTTPException(
            status_code=500,
            detail="Symptom analysis is temporarily unavailable. Please try again later.",
        ) from exc
