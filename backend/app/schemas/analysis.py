# backend/app/schemas/analysis.py

from typing import Any, Optional

from pydantic import BaseModel, Field, ConfigDict

class AnalysisRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=lambda field: "".join(
            word.capitalize() if i else word
            for i, word in enumerate(field.split("_"))
        ),
    )

    symptom_text: str = ""
    symptom_chips: list[str] = Field(default_factory=list)
    age: Optional[int] = None
    language: str = "auto"
    user_prakriti: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[int] = None
    body_areas: list[str] = Field(default_factory=list)

class WellnessCard(BaseModel):
    id: str
    title: str
    icon: str
    category: str
    recommendation: str
    ayurvedic_context: str = ""
    safety_precautions: str = ""
    details: str = ""
    evidence_status: str = "unavailable"
    citations: list[str] = Field(default_factory=list)
    citation_urls: list[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    status: str = "success"
    is_emergency: bool = False
    emergency_message: Optional[str] = None
    urgency: str = "low"

    original_symptom_text: str = ""
    recognized_symptoms: list[str] = Field(default_factory=list)
    unmatched_symptoms: list[str] = Field(default_factory=list)

    clarification_needed: bool = False
    clarification_questions: list[str] = Field(default_factory=list)

    candidate_conditions: list[Any] = Field(default_factory=list)
    symptom_summary: str = ""
    recognized_symptoms_summary: str = ""
    candidate_ranking_explanation: str = ""
    candidate_ranking_disclaimer: str = ""
    analysis_source: str = "none"

    dosha_imbalance: str = "Not assessed"
    ayurvedic_explanation: str = ""
    traditional_perspective: str = ""
    ayurvedic_citations: list[str] = Field(default_factory=list)
    ayurvedic_citation_urls: list[str] = Field(default_factory=list)
    traditional_perspective_citations: list[str] = Field(
        default_factory=list
    )

    evidence_grounded_summary: str = ""
    retrieved_evidence: list[Any] = Field(default_factory=list)
    wellness_cards: list[WellnessCard] = Field(default_factory=list)

    recommendations: list[str] = Field(default_factory=list)
    herbs: list[str] = Field(default_factory=list)
    lifestyle_guidance: list[str] = Field(default_factory=list)
    warning_signs: list[str] = Field(default_factory=list)
    when_to_seek_care: str = ""