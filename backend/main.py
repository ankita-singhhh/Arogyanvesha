
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1.router import api_router
from app.services.rag_service import RAGService
from app.services.symptom_extractor import SymptomExtractor
from app.services.gemini_service import GeminiService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG, symptom extraction, and Gemini services."""
    logger.info("Starting Arogyanvesha FastAPI Application...")

    try:
        RAGService.get_instance()
        SymptomExtractor.get_instance()
        GeminiService.get_instance()
        logger.info("Core services initialized successfully.")
    except Exception as exc:
        logger.error(
            "Startup error initializing core services: %s",
            exc,
            exc_info=True,
        )

    yield

    logger.info("Arogyanvesha API shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Clinical & Ayurvedic Wellness Platform API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

app.include_router(api_router)


@app.get("/")
def home():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
    }


@app.get("/health")
def health():
    """Liveness probe."""
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/ready")
def readiness():
    """Readiness probe for RAG and symptom extraction services."""
    try:
        rag = RAGService.get_instance()
        SymptomExtractor.get_instance()
        gemini = GeminiService.get_instance()

        rag_ready = len(rag.documents) > 0

        if not rag_ready:
            raise HTTPException(
                status_code=503,
                detail="RAG knowledge base is not ready.",
            )

        return {
            "status": "ready",
            "rag_ready": rag_ready,
            "rag_documents_count": len(rag.documents),
            "ai_provider": (
                "gemini" if gemini.client else "deterministic_fallback"
            ),
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Readiness check failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Service not ready.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
