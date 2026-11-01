from fastapi import APIRouter, HTTPException
from app.schemas.symptom import SymptomExtractRequest, SymptomExtractResponse
from app.services.symptom_extractor import SymptomExtractor
from app.core.logging import logger

router = APIRouter()

@router.post("/extract", response_model=SymptomExtractResponse)
def extract_symptoms(request: SymptomExtractRequest):
    """
    Extracts and normalizes symptoms from natural language text (English, Hindi, Hinglish).
    Maps expressions to the canonical 377 Random Forest symptom vocabulary.
    """
    try:
        extractor = SymptomExtractor.get_instance()
        return extractor.extract(request)
    except Exception as e:
        logger.error(f"Symptom extraction endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Symptom extraction failed: {str(e)}")
