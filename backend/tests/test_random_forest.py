import pytest
import numpy as np
from app.services.random_forest_service import RandomForestService

@pytest.fixture(scope="module")
def rf_service():
    return RandomForestService.get_instance()

def test_model_loading(rf_service):
    assert rf_service.model is not None
    assert len(rf_service.features) == 377
    assert len(rf_service.classes) == 512

def test_feature_vector_dimension(rf_service):
    vector, recognized, unknown = rf_service.construct_feature_vector(["headache", "fever", "cough"])
    assert vector.shape == (1, 377)
    assert len(recognized) >= 2
    assert "headache" in recognized
    assert "cough" in recognized

def test_prediction_known_symptoms(rf_service):
    response = rf_service.predict(["headache", "vomiting", "nausea"], top_k=5)
    assert response.status == "success"
    assert len(response.candidate_conditions) > 0
    assert response.active_features_count >= 2
    top = response.candidate_conditions[0]
    assert top.rank == 1
    assert 0.0 <= top.probability <= 1.0
    assert top.score_type == "uncalibrated_rf_probability"
    assert "not a clinical medical diagnosis" in response.disclaimer

def test_prediction_empty_input(rf_service):
    response = rf_service.predict([], top_k=5)
    assert response.status == "no_input"
    assert response.candidate_conditions == []
    assert response.requires_clarification is True

def test_prediction_unknown_symptoms(rf_service):
    response = rf_service.predict(["some_completely_invented_symptom_xyz"], top_k=5)
    assert response.status == "unrecognized_symptoms"
    assert len(response.unknown_symptoms) == 1
    assert response.candidate_conditions == []
