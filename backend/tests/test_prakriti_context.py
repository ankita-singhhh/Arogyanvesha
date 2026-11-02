import pytest
from pydantic import ValidationError

from app.schemas.analysis import AnalysisRequest


def test_analysis_accepts_no_prakriti_profile():
    request = AnalysisRequest(symptom_text="mild headache")
    assert request.user_prakriti is None


def test_analysis_accepts_saved_primary_only_profile():
    request = AnalysisRequest.model_validate({
        "symptom_text": "mild headache",
        "user_prakriti": {"primary": "pitta"},
    })
    assert request.user_prakriti.model_dump(exclude_none=True) == {
        "primary": "pitta",
    }


def test_analysis_accepts_full_profile_with_validated_percentages():
    request = AnalysisRequest.model_validate({
        "symptom_text": "mild headache",
        "user_prakriti": {
            "primary": "pitta",
            "secondary": "vata",
            "percentages": {"vata": 30, "pitta": 50, "kapha": 20},
        },
    })
    assert request.user_prakriti.primary == "pitta"
    assert request.user_prakriti.percentages.pitta == 50


@pytest.mark.parametrize(
    "profile",
    [
        {"primary": "unknown"},
        {"primary": "pitta", "secondary": "pitta"},
        {"percentages": {"vata": 30, "pitta": 50, "kapha": 10}},
        {"percentages": {"vata": 101, "pitta": 0, "kapha": -1}},
    ],
)
def test_analysis_rejects_invalid_or_inconsistent_profile_data(profile):
    with pytest.raises(ValidationError):
        AnalysisRequest.model_validate({
            "symptom_text": "mild headache",
            "user_prakriti": profile,
        })
