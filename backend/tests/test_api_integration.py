import pytest
import httpx
from main import app

pytestmark = pytest.mark.anyio

@pytest.fixture
def anyio_backend():
    return "asyncio"

async def test_health_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

async def test_ready_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.get("/ready")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ready"
        assert data["model_loaded"] is True
        assert data["feature_count"] == 377
        assert data["condition_classes_count"] == 512

async def test_predict_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {"symptoms": ["headache", "fever", "fatigue"], "top_k": 5}
        res = await client.post("/api/v1/predict", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["candidate_conditions"]) > 0
        assert "clinical medical diagnosis" in data["disclaimer"].lower()

async def test_symptoms_extract_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {"text": "I have had a high fever and headache since 2 days"}
        res = await client.post("/api/v1/symptoms/extract", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "headache" in data["canonical_symptoms"]
        assert "fever" in data["canonical_symptoms"]

async def test_rag_query_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {"conditions": ["acne"], "top_k": 2}
        res = await client.post("/api/v1/rag/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["passages"]) > 0

async def test_analyze_endpoint_normal():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "symptom_text": "I feel mild headache and slight fever",
            "duration": "1-3 days",
            "severity": 4
        }
        res = await client.post("/api/v1/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["is_emergency"] is False
        assert len(data["candidate_conditions"]) > 0
        assert len(data["recommendations"]) > 0
        assert [card["id"] for card in data["wellness_cards"]] == [
            "traditional_food", "herbal_support", "daily_lifestyle",
            "yoga_pranayama", "ayurvedic_wisdom",
        ]
        assert "disclaimer" in data

async def test_analyze_endpoint_accepts_symptom_chips_without_text():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        res = await client.post("/api/v1/analyze", json={"symptom_chips": ["headache", "fever"]})
        assert res.status_code == 200
        data = res.json()
        assert data["is_emergency"] is False
        assert {"headache", "fever"}.issubset(data["recognized_symptoms"])

async def test_analyze_endpoint_emergency_intercept():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "symptom_text": "sudden severe crushing chest pain and shortness of breath",
            "duration": "Less than a day",
            "severity": 10
        }
        res = await client.post("/api/v1/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["is_emergency"] is True
        assert data["urgency"] == "emergency"
        assert data["emergency_message"] is not None
        assert data["wellness_cards"] == []

async def test_chat_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        payload = {
            "messages": [{"role": "user", "content": "What Ayurvedic diet is good for high Pitta dosha?"}]
        }
        res = await client.post("/api/v1/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["reply"]) > 0
        assert "educational" in data["disclaimer"].lower()
