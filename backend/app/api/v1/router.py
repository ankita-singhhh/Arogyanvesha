
from fastapi import APIRouter

from app.api.v1.endpoints import (
    analyze,
    chat,
    prakriti,
    predict,
    rag,
    symptoms,
    yoga,
    wisdom,
    herbs,
)

api_router = APIRouter(prefix="/api/v1")
# ...existing routers...

api_router.include_router(
    yoga.router,
    prefix="/yoga",
    tags=["yoga"],
)
api_router.include_router(
    wisdom.router,
    prefix="/wisdom",
    tags=["Wisdom"],
)

api_router.include_router(
    herbs.router,
    prefix="/herbs",
    tags=["Herbs"],
)
api_router.include_router(
    prakriti.router,
    prefix="/prakriti",
    tags=["Prakriti"],
)

api_router.include_router(
    symptoms.router,
    prefix="/symptoms",
    tags=["symptoms"],
)

api_router.include_router(
    predict.router,
    prefix="/predict",
    tags=["prediction"],
)

api_router.include_router(
    rag.router,
    prefix="/rag",
    tags=["rag"],
)

api_router.include_router(
    analyze.router,
    prefix="/analyze",
    tags=["analysis"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"],
)
