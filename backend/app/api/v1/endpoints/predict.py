from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.random_forest_service import RandomForestService
from app.core.logging import logger

router = APIRouter()

@router.post("", response_model=PredictionResponse)
def predict_conditions(request: PredictionRequest):
    """
    Predicts candidate conditions using the trained Random Forest classifier.
    Expects recognized symptoms matching the 377 canonical features.
    """
    try:
        rf_service = RandomForestService.get_instance()
        return rf_service.predict(symptoms=request.symptoms, top_k=request.top_k or 5)
    except Exception:
        logger.exception("Prediction endpoint error")
        raise HTTPException(
            status_code=500,
            detail="Prediction service is temporarily unavailable.",
        )
