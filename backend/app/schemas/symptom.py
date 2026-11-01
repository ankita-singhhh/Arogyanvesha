from typing import List, Optional
from pydantic import BaseModel, Field

class SymptomExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Natural language description of symptoms")
    language: Optional[str] = Field("auto", description="Input language: en, hi, hinglish, or auto")
    existing_chips: Optional[List[str]] = Field(default_factory=list, description="Already recognized symptom chips")

class RecognizedSymptom(BaseModel):
    raw_term: str = Field(..., description="Original user term or snippet")
    canonical_feature: str = Field(..., description="Exact mapped feature in Random Forest feature space")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score of the match")
    is_explicit: bool = Field(True, description="Whether explicitly reported by user or inferred")

class SymptomExtractResponse(BaseModel):
    status: str = "success"
    recognized_symptoms: List[RecognizedSymptom] = Field(default_factory=list)
    canonical_symptoms: List[str] = Field(default_factory=list, description="List of recognized canonical features")
    uncertain_symptoms: List[str] = Field(default_factory=list, description="Terms that were ambiguous")
    unrecognized_symptoms: List[str] = Field(default_factory=list, description="Terms that could not be mapped")
    clarification_questions: List[str] = Field(default_factory=list, description="Follow-up clarification questions")
    requires_clarification: bool = False
    extraction_method: str = Field("gemini", description="gemini or deterministic_fallback")
