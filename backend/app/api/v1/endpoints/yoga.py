from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter()


# ─────────────────────────────────────────────────────────
# Schemas (field names match what the Next.js frontend reads)
# ─────────────────────────────────────────────────────────

class YogaSessionOut(BaseModel):
    id: str
    title: str
    description: str = ""
    duration_minutes: int
    level: str
    category: str
    thumbnail_url: str | None = None
    video_url: str | None = None
    dosha_target: str | None = None


class CompleteRequest(BaseModel):
    # Frontend currently sends durationActualMinutes (camelCase);
    # snake_case is accepted too, so either works.
    model_config = ConfigDict(populate_by_name=True)

    duration_actual_minutes: int | None = Field(
        default=None, alias="durationActualMinutes", ge=0, le=600
    )


class CompletionOut(BaseModel):
    duration_actual_minutes: int | None = None
    completed_at: str


class ProgressOut(BaseModel):
    # camelCase on purpose: the progress page reads totalSessions / totalMinutes.
    totalSessions: int
    totalMinutes: int
    completions: list[CompletionOut]


# ─────────────────────────────────────────────────────────
# Temporary data store
# Replace with your database. In-memory data is wiped on every
# Render restart/redeploy and is shared by all users.
# ─────────────────────────────────────────────────────────

SESSIONS: list[dict] = [
    {
        "id": "1",
        "title": "Gentle Morning Flow",
        "description": "A slow, grounding sequence to wake the body and steady the breath.",
        "duration_minutes": 15,
        "level": "beginner",
        "category": "flow",
        "thumbnail_url": None,
        "video_url": None,
        "dosha_target": "vata",
    },
    {
        "id": "2",
        "title": "Cooling Evening Stretch",
        "description": "Calming, cooling postures to release the day's heat and tension.",
        "duration_minutes": 20,
        "level": "beginner",
        "category": "stretching",
        "thumbnail_url": None,
        "video_url": None,
        "dosha_target": "pitta",
    },
    {
        "id": "3",
        "title": "Energizing Sun Salutations",
        "description": "A steady, warming practice to build energy and circulation.",
        "duration_minutes": 25,
        "level": "intermediate",
        "category": "strength",
        "thumbnail_url": None,
        "video_url": None,
        "dosha_target": "kapha",
    },
    {
        "id": "4",
        "title": "Breath and Relaxation",
        "description": "Simple breathing practices and a seated rest for stress relief.",
        "duration_minutes": 10,
        "level": "beginner",
        "category": "breathwork",
        "thumbnail_url": None,
        "video_url": None,
        "dosha_target": None,
    },
]

COMPLETIONS: list[dict] = []


def _find_session(session_id: str) -> dict:
    for session in SESSIONS:
        if session["id"] == session_id:
            return session
    raise HTTPException(status_code=404, detail="Yoga session not found.")


# ─────────────────────────────────────────────────────────
# Routes (mounted at /api/v1/yoga)
# ─────────────────────────────────────────────────────────

@router.get("/sessions", response_model=list[YogaSessionOut])
def list_sessions():
    return SESSIONS


@router.get("/sessions/{session_id}", response_model=YogaSessionOut)
def get_session(session_id: str):
    return _find_session(session_id)


@router.post("/sessions/{session_id}/complete", response_model=CompletionOut)
def complete_session(session_id: str, request: CompleteRequest):
    session = _find_session(session_id)
    minutes = (
        request.duration_actual_minutes
        if request.duration_actual_minutes is not None
        else session["duration_minutes"]
    )
    completion = {
        "duration_actual_minutes": minutes,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    COMPLETIONS.insert(0, completion)
    return completion


@router.get("/progress", response_model=ProgressOut)
def get_progress():
    total_minutes = sum(c["duration_actual_minutes"] or 0 for c in COMPLETIONS)
    return ProgressOut(
        totalSessions=len(COMPLETIONS),
        totalMinutes=total_minutes,
        completions=COMPLETIONS,
    )
