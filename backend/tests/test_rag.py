import pytest
from app.services.rag_service import RAGService
from app.schemas.rag import RAGQueryRequest

@pytest.fixture(scope="module")
def rag_service():
    return RAGService.get_instance()

def test_rag_loading(rag_service):
    assert len(rag_service.documents) > 0
    assert len(rag_service.source_registry) > 0

def test_rag_query_with_condition(rag_service):
    req = RAGQueryRequest(conditions=["acne"], top_k=3)
    res = rag_service.query(req)
    assert res.status == "success"
    assert len(res.passages) > 0
    assert any(p.condition == "acne" for p in res.passages)
    # Check source metadata is present
    for p in res.passages:
        assert p.source_name is not None
        assert p.url is not None

def test_rag_query_with_text(rag_service):
    req = RAGQueryRequest(query="breathing exercises and pranayama for asthma", conditions=["asthma"], top_k=3)
    res = rag_service.query(req)
    assert res.status == "success"
    assert len(res.passages) > 0

def test_rag_sources_list(rag_service):
    req = RAGQueryRequest(conditions=["depression", "anxiety"], top_k=4)
    res = rag_service.query(req)
    assert len(res.sources) > 0
    for s in res.sources:
        assert "source_name" in s
        assert "organization" in s
