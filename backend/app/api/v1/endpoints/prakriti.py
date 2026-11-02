from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# Temporary in-memory storage.
# Results are lost when the server restarts or redeploys.
PRAKRITI_RESULTS: dict[str, dict] = {}


def get_current_user_id() -> str:
    # TODO: Replace with your actual authentication dependency.
    return "anonymous"


class PrakritiSubmitRequest(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


class PrakritiSubmitResponse(BaseModel):
    primary_dosha: str
    secondary_dosha: str | None = None
    scores: dict[str, int]


@router.post("/submit", response_model=PrakritiSubmitResponse)
def submit_prakriti(
    request: PrakritiSubmitRequest,
) -> PrakritiSubmitResponse:
    """Calculate and save a temporary Prakriti assessment result."""

    if not request.answers:
        raise HTTPException(
            status_code=400,
            detail="Quiz answers are required.",
        )

    scores = {
        "vata": 0,
        "pitta": 0,
        "kapha": 0,
    }

    # Expects each answer value to be "vata", "pitta", or "kapha".
    for value in request.answers.values():
        dosha = str(value).strip().lower()

        if dosha in scores:
            scores[dosha] += 1

    if not any(scores.values()):
        raise HTTPException(
            status_code=422,
            detail="Answers did not contain valid dosha values.",
        )

    ranked = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    primary_dosha = ranked[0][0]
    secondary_dosha = (
        ranked[1][0]
        if ranked[1][1] > 0
        else None
    )

    result = PrakritiSubmitResponse(
        primary_dosha=primary_dosha,
        secondary_dosha=secondary_dosha,
        scores=scores,
    )

    user_id = get_current_user_id()
    PRAKRITI_RESULTS[user_id] = result.model_dump()

    return result


@router.get("/result", response_model=PrakritiSubmitResponse)
def get_prakriti_result() -> PrakritiSubmitResponse:
    """Return the latest saved Prakriti assessment result."""

    user_id = get_current_user_id()
    result = PRAKRITI_RESULTS.get(user_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No Prakriti assessment result found.",
        )

    return PrakritiSubmitResponse(**result)
