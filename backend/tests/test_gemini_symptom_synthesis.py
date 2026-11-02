import json
from types import SimpleNamespace

from app.schemas.prediction import CandidateCondition
from app.schemas.rag import RAGPassage
from app.services.gemini_service import GeminiService


def _passage():
    return RAGPassage(
        document_id="food-1", condition="example", category="food",
        content="A source-grounded traditional food passage.", source_id="AYUSH-1",
        source_name="AYUSH", organization="Ministry of AYUSH",
        url="https://example.test/ayush", source_grounded=True,
    )


def _candidate():
    return CandidateCondition(condition="example condition", probability=0.012345,
                              score_type="uncalibrated_rf_probability", rank=1)


def test_gemini_receives_source_metadata_and_returns_cited_cards(monkeypatch):
    service = GeminiService()
    captured = {}

    class Model:
        def generate_content(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(text=json.dumps({
                "symptom_summary": "Reported symptoms.",
                "dosha_imbalance": "Not established",
                "ayurvedic_explanation": "A traditional perspective based on the retrieved passage.",
                "evidence_grounded_summary": "Retrieved evidence was provided.",
                "recommendations": [], "herbs": [], "lifestyle_guidance": [],
                "warning_signs": [], "when_to_seek_care": "Seek care if worsening.",
                "urgency": "low",
                "ayurvedic_citation_document_ids": ["food-1"],
                "wellness_cards": [{
                    "id": "traditional_food",
                    "title": "Changed heading",
                    "recommendation": "Grounded food context.",
                    "ayurvedic_context": "A traditional relevance statement.",
                    "safety_precautions": "Check with a qualified clinician.",
                    "citation_document_ids": ["food-1"],
                }],
            }))

    service.client = SimpleNamespace(models=Model())
    result = service.generate_synthesis(
        symptom_text="symptoms", recognized_symptoms=["headache"], candidates=[_candidate()],
        retrieved_passages=[_passage()], body_areas=["Head"], duration="1-3 days", severity=3,
        user_prakriti={
            "primary": "pitta",
            "secondary": "vata",
            "percentages": {"vata": 30, "pitta": 50, "kapha": 20},
        },
    )

    assert result["wellness_cards"][0]["citation_document_ids"] == ["food-1"]
    assert result["wellness_cards"][0]["title"] == "Food and hydration"
    assert result["ayurvedic_citation_document_ids"] == ["food-1"]
    prompt = captured["contents"]
    assert "food-1" in prompt
    assert "AYUSH-1" in prompt
    assert '"body_areas": ["Head"]' in prompt
    assert '"primary": "pitta"' in prompt
    assert "Do not infer missing profile values" in prompt


def test_gemini_provider_failure_uses_safe_fallback():
    service = GeminiService()

    class Model:
        def generate_content(self, **kwargs):
            raise RuntimeError("provider unavailable")

    service.client = SimpleNamespace(models=Model())
    result = service.generate_synthesis(
        "symptoms", ["headache"], [], [_passage()],
        user_prakriti={"primary": "pitta"},
    )

    assert result["generated_by"] == "fallback"
    assert len(result["wellness_cards"]) == 5
    assert result["herbs"] == []


def test_fallback_returns_generic_cards_without_applying_prakriti():
    service = GeminiService()
    service.client = None
    result = service.generate_synthesis(
        "symptoms",
        ["headache"],
        [_candidate()],
        [_passage()],
        user_prakriti={"primary": "pitta"},
    )
    assert len(result["wellness_cards"]) == 5
    assert "pitta" not in json.dumps(result["wellness_cards"]).lower()
    assert result["herbs"] == []
