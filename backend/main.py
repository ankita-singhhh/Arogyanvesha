from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1.router import api_router
from app.services.random_forest_service import RandomForestService
from app.services.rag_service import RAGService
from app.services.symptom_extractor import SymptomExtractor
from app.services.gemini_service import GeminiService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup & shutdown events:
    Pre-loads model and knowledge base assets into memory.
    """
    logger.info("Starting Arogyanvesha FastAPI Application...")
    try:
        RandomForestService.get_instance()
        RAGService.get_instance()
        SymptomExtractor.get_instance()
        GeminiService.get_instance()
        logger.info("All model and RAG services initialized successfully.")
    except Exception as e:
        logger.error(
            f"Startup error loading core services: {e}",
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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.add_middleware(RateLimitMiddleware)

# Mount API routers
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
    """Liveness probe: verifies the API process is alive and responding."""
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/ready")
def readiness():
    """
    Readiness probe: checks that critical ML and RAG dependencies are loaded
    and ready. Does not expose sensitive credentials or file paths.
    """
    try:
        rf = RandomForestService.get_instance()
        rag = RAGService.get_instance()

        model_ready = rf.model is not None and len(rf.features) == 377
        rag_ready = len(rag.documents) > 0

        if not model_ready or not rag_ready:
            raise HTTPException(
                status_code=503,
                detail="Services not fully initialized.",
            )

        return {
            "status": "ready",
            "model_loaded": model_ready,
            "feature_count": len(rf.features),
            "condition_classes_count": len(rf.classes),
            "rag_documents_count": len(rag.documents),
            "ai_provider": (
                "gemini"
                if settings.GEMINI_API_KEY
                else "deterministic_fallback"
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
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