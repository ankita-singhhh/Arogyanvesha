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
                "dosha_imbalance": "Not established",
                "ayurvedic_explanation": "A traditional perspective based on the retrieved passage.",
                "evidence_grounded_summary": "Retrieved evidence was provided.",
                "recommendations": [], "herbs": [], "lifestyle_guidance": [],
                "warning_signs": [], "when_to_seek_care": "Seek care if worsening.",
                "urgency": "low",
                "ayurvedic_citation_document_ids": ["food-1"],
                "wellness_cards": [{"id": "traditional_food", "recommendation": "Grounded food context.", "citation_document_ids": ["food-1"]}],
            }))

    service.client = SimpleNamespace(models=Model())
    result = service.generate_synthesis(
        symptom_text="symptoms", recognized_symptoms=["headache"], candidates=[_candidate()],
        retrieved_passages=[_passage()], body_areas=["Head"], duration="1-3 days", severity=3,
    )

    assert result["wellness_cards"][0]["citation_document_ids"] == ["food-1"]
    assert result["ayurvedic_citation_document_ids"] == ["food-1"]
    prompt = captured["contents"]
    assert "food-1" in prompt
    assert "AYUSH-1" in prompt
    assert "uncalibrated_random_forest_score" in prompt
    assert '"body_areas": ["Head"]' in prompt


def test_fallback_leaves_cards_unavailable_for_the_endpoint_to_render():
    service = GeminiService()
    service.client = None
    result = service.generate_synthesis("symptoms", ["headache"], [_candidate()], [_passage()])
    assert result["wellness_cards"] == []
    assert result["herbs"] == []
