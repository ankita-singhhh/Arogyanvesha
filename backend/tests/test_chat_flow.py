
import json
import unittest
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


class TestChatFlow(unittest.TestCase):
    @patch("app.services.rag_service.RAGService.get_instance")
    @patch("app.services.gemini_service.GeminiService.get_instance")
    def test_empty_rag_fallback(self, mock_gemini_instance, mock_rag_instance):
        class MockRAGResult:
            passages = []
            sources = []

        mock_rag_instance.return_value = Mock(
            query=Mock(return_value=MockRAGResult())
        )
        mock_gemini_instance.return_value = None

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "What does Ayurveda say about wellness?",
                }
            ]
        }

        response = client.post("/api/v1/chat", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("No relevant passages", data.get("reply", ""))
        self.assertEqual(data.get("cards"), [])

    @patch("app.services.rag_service.RAGService.get_instance")
    @patch("app.services.gemini_service.GeminiService.get_instance")
    def test_grounded_response(self, mock_gemini_instance, mock_rag_instance):
        class MockPassage:
            source_name = "Ayurveda_Handbook"
            category = "evidence"
            content = "Turmeric has anti-inflammatory properties."

        class MockRAGResult:
            passages = [MockPassage()]
            sources = [
                {
                    "source_name": "Ayurveda_Handbook",
                    "category": "evidence",
                    "content": "Turmeric has anti-inflammatory properties.",
                }
            ]

        mock_rag_instance.return_value = Mock(
            query=Mock(return_value=MockRAGResult())
        )

        class MockGeminiClient:
            class models:
                @staticmethod
                def generate_content(*args, **kwargs):
                    class Resp:
                        text = "Turmeric may help calm inflammation."

                    return Resp()

        class MockGeminiService:
            client = MockGeminiClient()

        mock_gemini_instance.return_value = MockGeminiService()

        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "Can turmeric help my knee pain?",
                }
            ]
        }

        response = client.post("/api/v1/chat", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            data.get("reply"),
            "Turmeric may help calm inflammation.",
        )
        self.assertEqual(data.get("cards"), [])
        self.assertIsInstance(data.get("sources_cited"), list)
        self.assertTrue(data.get("sources_cited"))
        self.assertEqual(
            data["sources_cited"][0].get("source_name"),
            "Ayurveda_Handbook",
        )


if __name__ == "__main__":
    unittest.main()
