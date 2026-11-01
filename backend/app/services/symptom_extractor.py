
import os
import json
import re
import math
from typing import List, Dict, Any, Optional, Set, Tuple

from app.core.config import settings
from app.core.logging import logger
from app.schemas.symptom import (
    SymptomExtractRequest,
    SymptomExtractResponse,
    RecognizedSymptom,
)


class SymptomExtractor:
    _instance: Optional["SymptomExtractor"] = None

    NEGATION_WORDS = {
        "no", "not", "never", "without",
        "deny", "denies", "denied",
        "don't", "doesn't", "didn't",
        "haven't", "hasn't", "hadn't",
        "isn't", "aren't", "wasn't", "weren't",
        "nahi", "nahin", "nhi", "mat",
    }

    NEGATION_PHRASES = (
        "no longer",
        "not anymore",
        "not at present",
        "not currently",
        "does not have",
        "do not have",
        "did not have",
        "don't have",
        "doesn't have",
        "didn't have",
        "haven't got",
        "hasn't got",
        "not experiencing",
        "never experienced",
        "never had",
        "nahi hai",
        "nahin hai",
        "nhi hai",
        "nahi ho raha",
        "nahi ho rahi",
        "nahi hota",
        "nahi hoti",
        "nahi tha",
        "nahi thi",
        "bilkul nahi",
        "ab nahi",
        "abhi nahi",
    )

    CONTRAST_PATTERN = re.compile(
        r"\b(?:but|however|although|whereas|"
        r"lekin|magar|par)\b",
        re.IGNORECASE,
    )

    def __init__(self):
        self.aliases: Dict[str, str] = {}
        self.features: List[str] = []
        self.features_set: Set[str] = set()

        self._load_vocabularies()

        self.client = None
        self._init_gemini()

    @classmethod
    def get_instance(cls) -> "SymptomExtractor":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ---------------------------------------------------------
    # NORMALIZATION
    # ---------------------------------------------------------

    @staticmethod
    def _normalize(text: str) -> str:
        text = str(text or "").lower().strip()

        text = (
            text.replace("’", "'")
            .replace("‘", "'")
            .replace("–", "-")
            .replace("—", "-")
        )

        text = re.sub(r"\s+", " ", text)
        return text

    @staticmethod
    def _normalize_term(text: str) -> str:
        text = SymptomExtractor._normalize(text)
        text = re.sub(r"[^\w\s'-]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    # ---------------------------------------------------------
    # LOAD VOCABULARIES
    # ---------------------------------------------------------

    def _load_vocabularies(self):
        if not os.path.exists(settings.SYMPTOM_FEATURES_PATH):
            raise FileNotFoundError(
                f"Symptom features file not found: "
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

        self.features_set = {
            self._normalize_term(feature)
            for feature in self.features
        }

        if len(self.features) != len(self.features_set):
            raise ValueError(
                "Duplicate canonical symptoms found in "
                "symptom features JSON."
            )

        if not os.path.exists(settings.SYMPTOM_ALIASES_PATH):
            logger.warning(
                "Symptom aliases file not found. "
                "Using canonical feature matching only."
            )
            self.aliases = {}
            return

        with open(
            settings.SYMPTOM_ALIASES_PATH,
            "r",
            encoding="utf-8",
        ) as file:
            raw_aliases = json.load(file)

        if not isinstance(raw_aliases, dict):
            raise ValueError(
                "Symptom aliases JSON must contain an object."
            )

        valid_aliases = {}
        invalid_count = 0

        feature_lookup = {
            self._normalize_term(feature): feature
            for feature in self.features
        }

        for alias, target in raw_aliases.items():
            alias_key = self._normalize_term(alias)
            target_key = self._normalize_term(target)

            if not alias_key or not target_key:
                continue

            canonical = feature_lookup.get(target_key)

            if canonical is None:
                invalid_count += 1
                continue

            valid_aliases[alias_key] = canonical

        self.aliases = valid_aliases

        logger.info(
            f"Loaded {len(self.features)} canonical symptoms "
            f"and {len(self.aliases)} valid aliases."
        )

        if invalid_count:
            logger.warning(
                f"Ignored {invalid_count} aliases with "
                "invalid canonical targets."
            )

    # ---------------------------------------------------------
    # GEMINI INITIALIZATION
    # ---------------------------------------------------------

    def _init_gemini(self):
        api_key = getattr(settings, "GEMINI_API_KEY", None)

        if not api_key:
            logger.info(
                "GEMINI_API_KEY not configured. "
                "Using deterministic extraction."
            )
            return

        try:
            from google import genai

            self.client = genai.Client(api_key=api_key)

            logger.info(
                "Gemini symptom extraction client initialized."
            )

        except Exception as exc:
            logger.warning(
                f"Gemini initialization failed: {exc}"
            )
            self.client = None

    # ---------------------------------------------------------
    # TERM MATCHING
    # ---------------------------------------------------------

    @staticmethod
    def _term_pattern(term: str) -> re.Pattern:
        escaped = re.escape(term)

        return re.compile(
            r"(?<!\w)" + escaped + r"(?!\w)",
            flags=re.IGNORECASE,
        )

    def _find_term_mentions(
        self,
        text: str,
        term: str,
    ) -> List[Tuple[int, int]]:

        normalized_text = self._normalize(text)
        normalized_term = self._normalize_term(term)

        if not normalized_term:
            return []

        pattern = self._term_pattern(normalized_term)

        return [
            match.span()
            for match in pattern.finditer(normalized_text)
        ]

    # ---------------------------------------------------------
    # NEGATION DETECTION
    # ---------------------------------------------------------

    def _is_negated_mention(
        self,
        text: str,
        start: int,
        end: int,
    ) -> bool:
        """
        Detect common local negation.

        Contrast words such as 'but' and 'lekin' reset
        the preceding negation scope.

        This is a rule-based heuristic, not clinical NLP.
        """

        normalized_text = self._normalize(text)

        before = normalized_text[max(0, start - 90):start]
        after = normalized_text[end:min(len(normalized_text), end + 65)]

        # Reset negation scope after the latest contrast word.
        contrast_matches = list(
            self.CONTRAST_PATTERN.finditer(before)
        )

        if contrast_matches:
            before = before[contrast_matches[-1].end():]

        before_words = before.split()[-6:]
        after_words = after.split()[:5]

        before_context = " ".join(before_words)
        after_context = " ".join(after_words)

        # Check multi-word negation before the symptom.
        for phrase in self.NEGATION_PHRASES:
            pattern = (
                r"(?<!\w)"
                + re.escape(phrase)
                + r"(?!\w)"
            )

            if re.search(pattern, before_context):
                return True

        # Check multi-word negation after the symptom.
        for phrase in self.NEGATION_PHRASES:
            pattern = (
                r"(?<!\w)"
                + re.escape(phrase)
                + r"(?!\w)"
            )

            if re.search(pattern, after_context):
                return True

        # Check individual preceding negation words.
        preceding_words = [
            word.strip(".,!?;:()[]{}")
            for word in before_words
        ]

        for index, word in enumerate(preceding_words):
            if word not in self.NEGATION_WORDS:
                continue

            nearby = " ".join(preceding_words[index:])

            if word == "not" and re.search(
                r"\bnot\s+only\b",
                nearby,
            ):
                continue

            return True

        # Check Hindi/Hinglish negation immediately after symptom.
        following_words = [
            word.strip(".,!?;:()[]{}")
            for word in after_words
        ]

        if any(
            word in {"nahi", "nahin", "nhi", "mat"}
            for word in following_words
        ):
            return True

        return False

    def _has_positive_mention(
        self,
        text: str,
        term: str,
    ) -> bool:

        mentions = self._find_term_mentions(text, term)

        for start, end in mentions:
            if not self._is_negated_mention(
                text,
                start,
                end,
            ):
                return True

        return False

    # ---------------------------------------------------------
    # ADD RECOGNIZED SYMPTOM
    # ---------------------------------------------------------

    def _add_recognized(
        self,
        recognized_map: Dict[str, RecognizedSymptom],
        raw_term: str,
        canonical: str,
        confidence: float,
    ):
        canonical_key = self._normalize_term(canonical)

        if canonical_key not in self.features_set:
            return

        actual_canonical = next(
            feature
            for feature in self.features
            if self._normalize_term(feature) == canonical_key
        )

        if actual_canonical in recognized_map:
            return

        recognized_map[actual_canonical] = RecognizedSymptom(
            raw_term=str(raw_term),
            canonical_feature=actual_canonical,
            confidence=float(confidence),
            is_explicit=True,
        )

    # ---------------------------------------------------------
    # DETERMINISTIC EXTRACTION
    # ---------------------------------------------------------

    def deterministic_extract(
        self,
        text: str,
        existing_chips: Optional[List[str]] = None,
    ) -> SymptomExtractResponse:

        text = str(text or "")
        normalized_text = self._normalize(text)

        recognized_map: Dict[str, RecognizedSymptom] = {}
        uncertain: List[str] = []

        feature_lookup = {
            self._normalize_term(feature): feature
            for feature in self.features
        }

        # 1. Process explicitly selected symptom chips.
        if existing_chips:
            for chip in existing_chips:
                chip_clean = self._normalize_term(chip)

                if not chip_clean:
                    continue

                canonical = feature_lookup.get(chip_clean)

                if canonical:
                    self._add_recognized(
                        recognized_map,
                        chip,
                        canonical,
                        1.0,
                    )
                    continue

                canonical = self.aliases.get(chip_clean)

                if canonical:
                    self._add_recognized(
                        recognized_map,
                        chip,
                        canonical,
                        0.95,
                    )

        # 2. Match aliases, longest first.
        sorted_aliases = sorted(
            self.aliases.keys(),
            key=len,
            reverse=True,
        )

        for alias in sorted_aliases:
            mentions = self._find_term_mentions(
                normalized_text,
                alias,
            )

            for start, end in mentions:
                if self._is_negated_mention(
                    normalized_text,
                    start,
                    end,
                ):
                    continue

                canonical = self.aliases[alias]

                self._add_recognized(
                    recognized_map,
                    alias,
                    canonical,
                    0.90,
                )

                break

        # 3. Direct canonical feature matching.
        for feature in self.features:
            feature_key = self._normalize_term(feature)

            mentions = self._find_term_mentions(
                normalized_text,
                feature_key,
            )

            for start, end in mentions:
                if self._is_negated_mention(
                    normalized_text,
                    start,
                    end,
                ):
                    continue

                self._add_recognized(
                    recognized_map,
                    feature,
                    feature,
                    1.0,
                )

                break

        recognized_list = list(recognized_map.values())

        canonical_list = [
            item.canonical_feature
            for item in recognized_list
        ]

        clarifications = []

        if len(canonical_list) == 0:
            clarifications.append(
                "Could you describe your current symptoms, "
                "where you feel discomfort, and when it started?"
            )

        elif len(canonical_list) == 1:
            clarifications.append(
                f"Are you experiencing any other symptoms "
                f"along with {canonical_list[0]}? "
                "Please also mention its duration and severity."
            )

        return SymptomExtractResponse(
            status="success",
            recognized_symptoms=recognized_list,
            canonical_symptoms=canonical_list,
            uncertain_symptoms=uncertain,
            unrecognized_symptoms=[],
            clarification_questions=clarifications,
            requires_clarification=len(canonical_list) < 2,
            extraction_method="deterministic_fallback",
        )

    # ---------------------------------------------------------
    # GEMINI EXTRACTION
    # ---------------------------------------------------------

    def extract(
        self,
        request: SymptomExtractRequest,
    ) -> SymptomExtractResponse:

        text = str(request.text or "")
        chips = request.existing_chips or []

        if not self.client:
            return self.deterministic_extract(text, chips)

        prompt = f"""
You are a symptom extraction component for a health
information platform.

Extract ONLY symptoms explicitly reported by the user.

USER TEXT:
{text}

EXISTING USER-SELECTED SYMPTOM CHIPS:
{json.dumps(chips, ensure_ascii=False)}

CANONICAL SYMPTOM VOCABULARY:
{json.dumps(self.features, ensure_ascii=False)}

RULES:

1. Return only symptoms explicitly reported by the user.
2. Do not infer or invent symptoms.
3. Do not convert a denied symptom into a positive symptom.
4. Do not include symptoms mentioned only as examples.
5. Distinguish current symptoms from clearly historical symptoms.
6. Support English, Hindi and Hinglish.
7. Map each symptom to an exact canonical vocabulary item.
8. If the symptom is ambiguous, place it in uncertain.
9. Do not diagnose any disease.
10. Confidence must be between 0 and 1.
11. Return an empty recognized list if no symptom is reported.

Return valid JSON only:

{{
    "recognized": [
        {{
            "raw_term": "sir dard",
            "canonical_feature": "headache",
            "confidence": 0.95
        }}
    ],
    "uncertain": [],
    "clarifications": []
}}
"""

        try:
            from google.genai import types

            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )

            response_text = response.text or "{}"
            data = json.loads(response_text)

            if not isinstance(data, dict):
                raise ValueError(
                    "Gemini returned an invalid JSON structure."
                )

            recognized_map: Dict[str, RecognizedSymptom] = {}

            feature_lookup = {
                self._normalize_term(feature): feature
                for feature in self.features
            }

            chip_keys = {
                self._normalize_term(chip)
                for chip in chips
            }

            # 1. Validate Gemini symptoms.
            for item in data.get("recognized", []):
                if not isinstance(item, dict):
                    continue

                raw_term = str(
                    item.get("raw_term", "")
                ).strip()

                canonical = str(
                    item.get("canonical_feature", "")
                ).strip()

                if not raw_term or not canonical:
                    continue

                try:
                    confidence = float(
                        item.get("confidence", 0)
                    )
                except (TypeError, ValueError):
                    continue

                if not math.isfinite(confidence):
                    continue

                if not 0.65 <= confidence <= 1.0:
                    continue

                canonical_key = self._normalize_term(canonical)

                actual_canonical = feature_lookup.get(
                    canonical_key
                )

                if actual_canonical is None:
                    continue

                raw_key = self._normalize_term(raw_term)

                # Accept explicit chips.
                is_in_chip = (
                    raw_key in chip_keys
                    or canonical_key in chip_keys
                )

                # Accept only positive mentions in user text.
                is_in_text = self._has_positive_mention(
                    text,
                    raw_term,
                )

                is_canonical_in_text = self._has_positive_mention(
                    text,
                    actual_canonical,
                )

                if not (
                    is_in_chip
                    or is_in_text
                    or is_canonical_in_text
                ):
                    continue

                self._add_recognized(
                    recognized_map,
                    raw_term,
                    actual_canonical,
                    confidence,
                )

            # 2. Supplement with deterministic extraction.
            deterministic_result = self.deterministic_extract(
                text,
                chips,
            )

            for symptom in deterministic_result.recognized_symptoms:
                self._add_recognized(
                    recognized_map,
                    symptom.raw_term,
                    symptom.canonical_feature,
                    symptom.confidence,
                )

            recognized_items = list(recognized_map.values())

            canonical_items = [
                item.canonical_feature
                for item in recognized_items
            ]

            uncertain = data.get("uncertain", [])

            if not isinstance(uncertain, list):
                uncertain = []

            clarifications = data.get("clarifications", [])

            if not isinstance(clarifications, list):
                clarifications = []

            clarifications = [
                str(question).strip()
                for question in clarifications
                if str(question).strip()
            ]

            # Add fallback questions when information is limited.
            if len(canonical_items) < 2:
                for question in (
                    deterministic_result.clarification_questions
                ):
                    if question not in clarifications:
                        clarifications.append(question)

            return SymptomExtractResponse(
                status="success",
                recognized_symptoms=recognized_items,
                canonical_symptoms=canonical_items,
                uncertain_symptoms=[
                    str(item) for item in uncertain
                ],
                unrecognized_symptoms=[],
                clarification_questions=clarifications,
                requires_clarification=len(canonical_items) < 2,
                extraction_method="gemini_validated",
            )

        except Exception as exc:
            logger.warning(
                "Gemini symptom extraction failed. "
                f"Using deterministic fallback. Error: {exc}"
            )

            return self.deterministic_extract(text, chips)
