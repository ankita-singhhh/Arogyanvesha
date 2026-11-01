from typing import List, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    symptoms: List[str] = Field(
        ...,
        min_length=1,
        description="List of recognized symptoms",
    )
    top_k: Optional[int] = Field(
        5,
        ge=1,
        le=20,
        description="Number of top candidates to return",
    )


class CandidateCondition(BaseModel):
    condition: str = Field(
        ...,
        description="Potential condition suggested by the AI",
    )
    probability: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Probability estimate, if available",
    )
    score_type: str = Field(
        "gemini_generated_rank",
        description="How the candidate was generated or scored",
    )
    rank: int = Field(
        ...,
        ge=1,
        description="Rank among suggested candidates",
    )


class PredictionResponse(BaseModel):
    status: str = "success"
    recognized_symptoms: List[str] = Field(default_factory=list)
    unknown_symptoms: List[str] = Field(default_factory=list)
    candidate_conditions: List[CandidateCondition] = Field(default_factory=list)
    requires_clarification: bool = False
    feature_vector_dimension: Optional[int] = None
    active_features_count: Optional[int] = None
    disclaimer: str = (
        "These are AI-generated possibilities based on the reported symptoms, "
        "not a clinical diagnosis. Do not use them as a substitute for "
        "professional medical advice."
    )
