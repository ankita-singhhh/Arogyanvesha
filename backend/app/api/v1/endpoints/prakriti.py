from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any

router = APIRouter()


class PrakritiSubmitRequest(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


class PrakritiSubmitResponse(BaseModel):
    primary_dosha: str
    secondary_dosha: str | None = None
    scores: dict[str, int]


@router.post("/submit", response_model=PrakritiSubmitResponse)
def submit_prakriti(request: PrakritiSubmitRequest):
    """
    Temporary endpoint contract.
    Replace scoring with the quiz's actual answer-to-dosha mapping.
    """
    if not request.answers:
        raise HTTPException(status_code=400, detail="Quiz answers are required.")

    # Placeholder scoring: expects each answer value to be "vata", "pitta", or "kapha".
    scores = {"vata": 0, "pitta": 0, "kapha": 0}

    for value in request.answers.values():
        dosha = str(value).strip().lower()
        if dosha in scores:
            scores[dosha] += 1

    if not any(scores.values()):
        raise HTTPException(
            status_code=422,
            detail="Answers did not contain valid dosha values.",
        )

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return PrakritiSubmitResponse(
        primary_dosha=ranked[0][0],
        secondary_dosha=ranked[1][0] if ranked[1][1] > 0 else None,
        scores=scores,
    )
