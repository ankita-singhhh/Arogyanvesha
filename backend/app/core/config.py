
import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


# Determine base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Arogyanvesha API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # AI Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Allow Gemini enough time to complete requests.
    GEMINI_REQUEST_TIMEOUT_MS: int = 30000
    GEMINI_RETRY_ATTEMPTS: int = 1

    # ML Model Configuration
    MODEL_PATH: str = str(
        WORKSPACE_ROOT / "model" / "arogyanvesha_random_forest_final.joblib"
    )
    SYMPTOM_FEATURES_PATH: str = str(
        WORKSPACE_ROOT / "config" / "arogyanvesha_symptom_features.json"
    )
    SYMPTOM_ALIASES_PATH: str = str(
        WORKSPACE_ROOT / "config" / "arogyanvesha_symptom_aliases.json"
    )

    # RAG Configuration
    KNOWLEDGE_BASE_DIR: str = str(WORKSPACE_ROOT / "ayurvedic_knowledge")
    RAG_DOCUMENTS_FILE: str = "rag_documents_provenance_aware_v4.json"
    RAG_EMBEDDINGS_FILE: str = "rag_embeddings_gemini_v1.npy"
    SOURCE_REGISTRY_FILE: str = "source_registry.json"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_DEFAULT: int = 60
    RATE_LIMIT_ANALYZE: int = 10
    RATE_LIMIT_CHAT: int = 15

    # Pipeline Tuning
    TOP_K_PREDICTIONS: int = 5
    TOP_K_RAG: int = 4
    MIN_PREDICTION_PROBABILITY: float = 0.005


settings = Settings()
