import json
from typing import List, Dict, Tuple, Optional

import numpy as np
import joblib
from huggingface_hub import hf_hub_download

from app.core.config import settings
from app.core.logging import logger
from app.schemas.prediction import (
    CandidateCondition,
    PredictionResponse,
)


class RandomForestService:
    _instance: Optional["RandomForestService"] = None

    def __init__(self):
        self.model = None
        self.features: List[str] = []
        self.feature_index_map: Dict[str, int] = {}
        self.classes: List[str] = []

        self._load_artifacts()

    @classmethod
    def get_instance(cls) -> "RandomForestService":
        if cls._instance is None:
            cls._instance = cls()

        return cls._instance

    @staticmethod
    def _normalize(value: str) -> str:
        return str(value or "").lower().strip()

    # ---------------------------------------------------------
    # LOAD MODEL AND FEATURES
    # ---------------------------------------------------------

    def _load_artifacts(self):
        """
        Load the trained model from Hugging Face and canonical
        symptom features from the local JSON file.

        Validate feature count, uniqueness, and output classes.
        """

        logger.info(
            "Loading symptom features from: "
            f"{settings.SYMPTOM_FEATURES_PATH}"
        )

        with open(
            settings.SYMPTOM_FEATURES_PATH,
            "r",
            encoding="utf-8",
        ) as file:
            loaded_features = json.load(file)

        if not isinstance(loaded_features, list):
            raise ValueError(
                "Symptom features JSON must contain a list."
            )

        self.features = [
            str(feature).strip()
            for feature in loaded_features
            if str(feature).strip()
        ]

        normalized_features = [
            self._normalize(feature)
            for feature in self.features
        ]

        if len(normalized_features) != len(set(normalized_features)):
            raise ValueError(
                "Duplicate symptom features found. "
                "Resolve duplicates before loading the model."
            )

        self.feature_index_map = {
            self._normalize(feature): index
            for index, feature in enumerate(self.features)
        }

        logger.info(
            f"Loaded {len(self.features)} canonical symptom features."
        )

        # Download model from Hugging Face
        logger.info(
            "Downloading Random Forest model from Hugging Face..."
        )

        model_path = hf_hub_download(
            repo_id="newcoder26/Arogyanvesha-RF",
            filename="arogyanvesha_random_forest_final.joblib",
            repo_type="model",
        )

        logger.info("Loading downloaded Random Forest model...")

        self.model = joblib.load(model_path)

        # Check input dimensions
        if not hasattr(self.model, "n_features_in_"):
            raise ValueError(
                "Model does not expose n_features_in_. "
                "Cannot validate input dimensions."
            )

        expected_features = int(self.model.n_features_in_)

        if expected_features != len(self.features):
            raise ValueError(
                f"Feature dimension mismatch: model expects "
                f"{expected_features}, but JSON contains "
                f"{len(self.features)}."
            )

        # Validate class labels
        if not hasattr(self.model, "classes_"):
            raise ValueError(
                "Loaded model does not expose classes_."
            )

        self.classes = [
            str(label)
            for label in self.model.classes_
        ]

        if not self.classes:
            raise ValueError(
                "Random Forest model contains no output classes."
            )

        # Validate feature names if retained by the model
        model_feature_names = getattr(
            self.model,
            "feature_names_in_",
            None,
        )

        if model_feature_names is not None:
            model_names = [
                self._normalize(name)
                for name in model_feature_names
            ]

            json_names = [
                self._normalize(name)
                for name in self.features
            ]

            if model_names != json_names:
                raise ValueError(
                    "Feature ordering mismatch between model "
                    "feature_names_in_ and symptom features JSON."
                )

            logger.info(
                "Model feature names and JSON feature order match."
            )
        else:
            logger.warning(
                "Model does not contain feature_names_in_. "
                "Feature ordering cannot be verified from the "
                "model artifact alone."
            )

        logger.info(
            "Random Forest model loaded successfully. "
            f"Features: {len(self.features)}, "
            f"Classes: {len(self.classes)}"
        )

    # ---------------------------------------------------------
    # FEATURE VECTOR CONSTRUCTION
    # ---------------------------------------------------------

    def construct_feature_vector(
        self,
        symptoms: List[str],
    ) -> Tuple[np.ndarray, List[str], List[str]]:
        """
        Convert canonical symptom strings into a binary vector.

        Feature order is exactly the order in the loaded
        symptom features JSON.
        """

        vector = np.zeros(
            (1, len(self.features)),
            dtype=np.float32,
        )

        recognized = []
        unknown = []

        recognized_set = set()
        unknown_set = set()

        for symptom in symptoms:
            clean = self._normalize(symptom)

            if not clean:
                continue

            if clean in self.feature_index_map:
                index = self.feature_index_map[clean]
                canonical = self.features[index]

                vector[0, index] = 1.0

                if canonical not in recognized_set:
                    recognized.append(canonical)
                    recognized_set.add(canonical)
            else:
                if symptom not in unknown_set:
                    unknown.append(symptom)
                    unknown_set.add(symptom)

        return vector, recognized, unknown

    # ---------------------------------------------------------
    # PREDICTION
    # ---------------------------------------------------------

    def predict(
        self,
        symptoms: List[str],
        top_k: int = 5,
    ) -> PredictionResponse:
        """
        Return top-k Random Forest candidate conditions.

        Scores are uncalibrated model outputs and must not be
        interpreted as confirmed diagnoses or clinical certainty.
        """

        if not symptoms:
            return PredictionResponse(
                status="no_input",
                recognized_symptoms=[],
                unknown_symptoms=[],
                candidate_conditions=[],
                requires_clarification=True,
                feature_vector_dimension=len(self.features),
                active_features_count=0,
            )

        if self.model is None:
            raise RuntimeError(
                "Random Forest model has not been loaded."
            )

        try:
            top_k = int(top_k)
        except (TypeError, ValueError):
            top_k = 5

        top_k = max(
            1,
            min(top_k, len(self.classes)),
        )

        vector, recognized, unknown = (
            self.construct_feature_vector(symptoms)
        )

        active_count = int(np.count_nonzero(vector))

        if active_count == 0:
            return PredictionResponse(
                status="unrecognized_symptoms",
                recognized_symptoms=[],
                unknown_symptoms=unknown,
                candidate_conditions=[],
                requires_clarification=True,
                feature_vector_dimension=len(self.features),
                active_features_count=0,
            )

        if vector.shape != (1, len(self.features)):
            raise ValueError(
                f"Invalid feature vector shape: {vector.shape}"
            )

        try:
            probabilities = self.model.predict_proba(vector)[0]
        except Exception as exc:
            logger.exception(
                "Random Forest inference failed."
            )

            raise RuntimeError(
                f"Model prediction failed: {exc}"
            ) from exc

        probabilities = np.asarray(
            probabilities,
            dtype=np.float64,
        )

        if probabilities.ndim != 1:
            raise ValueError(
                "Unexpected prediction output dimensions."
            )

        if len(probabilities) != len(self.classes):
            raise ValueError(
                "Prediction output count does not match "
                "the model class count."
            )

        if not np.all(np.isfinite(probabilities)):
            raise ValueError(
                "Model returned non-finite prediction scores."
            )

        if np.any(probabilities < 0):
            raise ValueError(
                "Model returned negative prediction scores."
            )

        top_indices = np.argsort(
            probabilities
        )[::-1][:top_k]

        candidates = []

        for rank, index in enumerate(
            top_indices,
            start=1,
        ):
            score = float(probabilities[index])

            candidates.append(
                CandidateCondition(
                    condition=self.classes[index],
                    probability=round(score, 6),
                    score_type="uncalibrated_rf_probability",
                    rank=rank,
                )
            )

        logger.info(
            "Random Forest prediction completed. "
            f"Recognized symptoms: {recognized}; "
            f"Active features: {active_count}; "
            f"Candidates returned: {len(candidates)}"
        )

        return PredictionResponse(
            status="success",
            recognized_symptoms=recognized,
            unknown_symptoms=unknown,
            candidate_conditions=candidates,
            requires_clarification=len(recognized) < 2,
            feature_vector_dimension=len(self.features),
            active_features_count=active_count,
        )