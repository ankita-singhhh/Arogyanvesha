# backend/app/schemas/analysis.py

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, ConfigDict, model_validator


Dosha = Literal["vata", "pitta", "kapha"]


class PrakritiPercentages(BaseModel):
    vata: int = Field(ge=0, le=100)
    pitta: int = Field(ge=0, le=100)
    kapha: int = Field(ge=0, le=100)

    @model_validator(mode="after")
    def percentages_total_one_hundred(self):
        if self.vata + self.pitta + self.kapha != 100:
            raise ValueError("Prakriti percentages must total 100.")
        return self


class PrakritiProfile(BaseModel):
    primary: Optional[Dosha] = None
    secondary: Optional[Dosha] = None
    percentages: Optional[PrakritiPercentages] = None

    @model_validator(mode="after")
    def validate_profile(self):
        if self.primary and self.primary == self.secondary:
            raise ValueError("Primary and secondary Dosha must differ.")
        if not any((self.primary, self.secondary, self.percentages)):
            raise ValueError("Prakriti profile must contain validated data.")
        return self

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
    user_prakriti: Optional[PrakritiProfile] = None
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