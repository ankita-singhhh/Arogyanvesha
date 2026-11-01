from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RAGQueryRequest(BaseModel):
    query: Optional[str] = Field(None, description="Free text user query or symptom description")
    conditions: Optional[List[str]] = Field(default_factory=list, description="Candidate conditions to filter or prioritize")
    categories: Optional[List[str]] = Field(default_factory=list, description="Categories e.g. lifestyle, food, ayurvedic_perspective")
    top_k: Optional[int] = Field(4, ge=1, le=15, description="Maximum passages to retrieve")

class RAGPassage(BaseModel):
    document_id: str
    condition: str
    category: str
    content: str
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    organization: Optional[str] = None
    url: Optional[str] = None
    knowledge_type: Optional[str] = None
    knowledge_origin: Optional[str] = None
    source_grounded: bool = True
    similarity_score: float = Field(0.0, description="Relevance or cosine similarity score")

class RAGQueryResponse(BaseModel):
    status: str = "success"
    query: Optional[str] = None
    matched_conditions: List[str] = Field(default_factory=list)
    passages: List[RAGPassage] = Field(default_factory=list)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    total_retrieved: int = 0
    disclaimer: str = (
        "Ayurvedic guidance is derived from classical traditional literature and official AYUSH documents. "
        "It is educational and complementary, not a scientifically established cure or replacement for medical care."
    )
