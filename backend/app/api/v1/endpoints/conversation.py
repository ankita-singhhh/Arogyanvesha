import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.endpoints.chat import chat_with_ai_vaidya
from app.schemas.chat import ChatRequest

router = APIRouter()

DEFAULT_TITLE = "New consultation"

# Temporary in-memory storage. Data is lost on Render restart.
CONVERSATIONS: dict[str, dict] = {}
MESSAGES: dict[str, list[dict]] = {}


def get_current_user_id() -> str:
    # TODO: Replace with your real authentication dependency.
    return "anonymous"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_owned_conversation(conversation_id: str, user_id: str) -> dict:
    conversation = CONVERSATIONS.get(conversation_id)

    if not conversation or conversation["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return conversation


class ConversationCreate(BaseModel):
    title: str = Field(default=DEFAULT_TITLE, max_length=200)


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    last_message: str | None = None
    message_count: int = 0
    created_at: str
    last_message_at: str | None = None


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
    confidence: str | None = None


@router.get("", response_model=list[ConversationOut])
def list_conversations():
    user_id = get_current_user_id()

    conversations = [
        conversation
        for conversation in CONVERSATIONS.values()
        if conversation["user_id"] == user_id
    ]

    conversations.sort(
        key=lambda item: item["last_message_at"] or item["created_at"],
        reverse=True,
    )

    return conversations


@router.post("", response_model=ConversationOut)
def create_conversation(request: ConversationCreate):
    user_id = get_current_user_id()

    conversation = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": request.title.strip() or DEFAULT_TITLE,
        "last_message": None,
        "message_count": 0,
        "created_at": _now(),
        "last_message_at": None,
    }

    CONVERSATIONS[conversation["id"]] = conversation
    MESSAGES[conversation["id"]] = []

    return conversation


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(conversation_id: str):
    _get_owned_conversation(
        conversation_id,
        get_current_user_id(),
    )

    return MESSAGES.get(conversation_id, [])


@router.post("/{conversation_id}/messages", response_model=MessageOut)
def send_message(conversation_id: str, request: MessageIn):
    conversation = _get_owned_conversation(
        conversation_id,
        get_current_user_id(),
    )

    text = request.content.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    history = MESSAGES.setdefault(conversation_id, [])

    recent_messages = [
        {"role": message["role"], "content": message["content"]}
        for message in history[-9:]
    ]
    recent_messages.append({"role": "user", "content": text})

    ai_response = chat_with_ai_vaidya(
        ChatRequest(messages=recent_messages)
    )

    user_message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "role": "user",
        "content": text,
        "created_at": _now(),
        "confidence": None,
    }

    assistant_message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": ai_response.reply,
        "created_at": _now(),
        "confidence": getattr(ai_response, "confidence", None),
    }

    history.extend([user_message, assistant_message])

    if conversation["title"] == DEFAULT_TITLE:
        conversation["title"] = text[:50] + ("…" if len(text) > 50 else "")

    conversation["last_message"] = ai_response.reply[:80]
    conversation["message_count"] = len(history)
    conversation["last_message_at"] = assistant_message["created_at"]

    return assistant_message
