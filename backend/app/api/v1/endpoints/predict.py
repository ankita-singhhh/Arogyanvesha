from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictionRequest, PredictionResponse

router = APIRouter()


@router.post("", response_model=PredictionResponse)
def predict_conditions(request: PredictionRequest):
    raise HTTPException(
        status_code=503,
        detail=(
            "Standalone prediction is unavailable. "
            "Use the /api/v1/analyze endpoint for AI-generated "
            "candidate conditions."
        ),
    )
