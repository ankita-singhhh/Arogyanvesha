from fastapi import APIRouter, HTTPException
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import RAGService
from app.core.logging import logger

router = APIRouter()

@router.post("/query", response_model=RAGQueryResponse)
def query_knowledge_base(request: RAGQueryRequest):
    """
    Retrieves evidence-grounded Ayurvedic and clinical passages from official Ministry of AYUSH,
    WHO, and NCCIH documents.
    """
    try:
        rag_service = RAGService.get_instance()
        return rag_service.query(request)
    except Exception as e:
        logger.error(f"RAG query endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {str(e)}")
