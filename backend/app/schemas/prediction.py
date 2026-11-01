from typing import List, Optional
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    symptoms: List[str] = Field(..., min_length=1, description="List of recognized symptoms")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Number of top candidates to return")

class CandidateCondition(BaseModel):
    condition: str = Field(..., description="Condition / disease name")
    probability: float = Field(..., ge=0.0, le=1.0, description="Model probability estimate")
    score_type: str = Field("uncalibrated_rf_probability", description="Description of probability calibration")
    rank: int = Field(..., ge=1, description="Rank among predicted candidates")

class PredictionResponse(BaseModel):
    status: str = "success"
    recognized_symptoms: List[str] = Field(default_factory=list)
    unknown_symptoms: List[str] = Field(default_factory=list)
    candidate_conditions: List[CandidateCondition] = Field(default_factory=list)
    requires_clarification: bool = False
    feature_vector_dimension: int = 377
    active_features_count: int = 0
    disclaimer: str = (
        "These are model-generated candidate conditions based on a statistical Random Forest classifier, "
        "not a clinical medical diagnosis. Do not use this as a substitute for professional medical advice."
    )
