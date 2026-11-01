from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="user, assistant, or system")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1)
    user_context: Optional[Dict[str, Any]] = Field(
        None,
        description="Prakriti, streak, name, age if authenticated",
    )
    candidate_condition: Optional[str] = Field(
        None,
        description="Active candidate condition from symptom check",
    )


class WellnessCard(BaseModel):
    id: str
    title: str
    content: str
    citations: List[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    status: str = "success"
    reply: str
    cards: List[WellnessCard] = Field(default_factory=list)
    is_emergency: bool = False
    emergency_message: Optional[str] = None
    sources_cited: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: str = Field(
        "medium",
        description="high, medium, or low",
    )
    disclaimer: str = (
        "This conversation is for Ayurvedic educational and wellness "
        "exploration only. AI Vaidya is not a doctor. Consult a licensed "
        "medical doctor or Vaidya for health emergencies."
    )