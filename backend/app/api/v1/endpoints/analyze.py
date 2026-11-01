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
