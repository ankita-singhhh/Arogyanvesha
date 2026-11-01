import pytest
from app.services.symptom_extractor import SymptomExtractor
from app.schemas.symptom import SymptomExtractRequest

@pytest.fixture(scope="module")
def extractor():
    return SymptomExtractor.get_instance()

def test_extract_english_symptoms(extractor):
    req = SymptomExtractRequest(text="I have had a severe headache and high fever since morning")
    res = extractor.deterministic_extract(req.text)
    assert res.status == "success"
    canonical = [r.canonical_feature for r in res.recognized_symptoms]
    assert "headache" in canonical
    assert "fever" in canonical

def test_extract_hindi_hinglish_symptoms(extractor):
    req = SymptomExtractRequest(text="mujhe do din se sir dard aur bukhar hai aur thakan lag rahi hai")
    res = extractor.deterministic_extract(req.text)
    assert res.status == "success"
    canonical = [r.canonical_feature for r in res.recognized_symptoms]
    assert "headache" in canonical
    assert "fever" in canonical
    assert "fatigue" in canonical

def test_extract_digestive_symptoms_hinglish(extractor):
    req = SymptomExtractRequest(text="pet me tez dard aur ulti ho rahi hai")
    res = extractor.deterministic_extract(req.text)
    canonical = [r.canonical_feature for r in res.recognized_symptoms]
    assert "sharp abdominal pain" in canonical
    assert "vomiting" in canonical

def test_clarification_on_vague_input(extractor):
    req = SymptomExtractRequest(text="I feel bad")
    res = extractor.deterministic_extract(req.text)
    assert res.requires_clarification is True
    assert len(res.clarification_questions) > 0
