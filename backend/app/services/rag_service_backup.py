
import os
import json
import re
from typing import List, Dict, Any, Optional, Set

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings
from app.core.logging import logger
from app.schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGPassage
)


class RAGService:
    _instance: Optional["RAGService"] = None

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self.source_registry: Dict[str, Dict[str, Any]] = {}
        self.condition_doc_map: Dict[str, List[int]] = {}

        self.word_vectorizer = None
        self.char_vectorizer = None
        self.word_matrix = None
        self.char_matrix = None
        self.document_texts: List[str] = []

        self._load_knowledge_base()
        self._build_retrieval_index()

    @classmethod
    def get_instance(cls) -> "RAGService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_knowledge_base(self):
        """Load existing documents, embeddings and source registry."""

        kb_dir = settings.KNOWLEDGE_BASE_DIR

        doc_path = os.path.join(
            kb_dir, settings.RAG_DOCUMENTS_FILE
        )

        emb_path = os.path.join(
            kb_dir, settings.RAG_EMBEDDINGS_FILE
        )

        registry_path = os.path.join(
            kb_dir, settings.SOURCE_REGISTRY_FILE
        )

        logger.info(f"Loading RAG documents: {doc_path}")

        if not os.path.exists(doc_path):
            logger.error("RAG documents file not found.")
            return

        with open(doc_path, "r", encoding="utf-8") as f:
            self.documents = json.load(f)

        logger.info(
            f"Loaded {len(self.documents)} RAG documents."
        )

        # Load existing embeddings for compatibility.
        # They are not used for query similarity because
        # their original generation model is unknown.

        if os.path.exists(emb_path):
            try:
                self.embeddings = np.load(
                    emb_path,
                    allow_pickle=False
                )

                logger.info(
                    f"Loaded existing embeddings: "
                    f"{self.embeddings.shape}"
                )

                if (
                    self.embeddings.ndim != 2
                    or self.embeddings.shape[0] != len(self.documents)
                ):
                    logger.warning(
                        "Embedding/document count mismatch. "
                        "Existing embeddings will not be used."
                    )
                    self.embeddings = None

            except Exception as e:
                logger.error(
                    f"Could not load existing embeddings: {e}"
                )
                self.embeddings = None

        # Load source registry.

        if os.path.exists(registry_path):
            try:
                with open(
                    registry_path,
                    "r",
                    encoding="utf-8"
                ) as f:
                    registry = json.load(f)

                for item in registry:
                    source_id = item.get("source_id")
                    if source_id:
                        self.source_registry[source_id] = item

                logger.info(
                    f"Loaded {len(self.source_registry)} sources."
                )

            except Exception as e:
                logger.error(
                    f"Source registry loading failed: {e}"
                )

        # Build condition index.

        self.condition_doc_map.clear()

        for idx, doc in enumerate(self.documents):
            condition = str(
                doc.get("condition", "general")
            ).lower().strip()

            self.condition_doc_map.setdefault(
                condition, []
            ).append(idx)

    def _build_retrieval_index(self):
        """
        Build lightweight multilingual-friendly lexical indexes.

        Word TF-IDF captures matching terms.
        Character TF-IDF captures partial words and spelling variations.
        """

        if not self.documents:
            logger.warning("No documents available for indexing.")
            return

        self.document_texts = []

        for doc in self.documents:
            condition = str(
                doc.get("condition", "")
            )

            category = str(
                doc.get("category", "")
            )

            content = str(
                doc.get("content", "")
            )

            combined = (
                f"{condition} {category} {content}"
            ).strip()

            self.document_texts.append(combined)

        try:
            self.word_vectorizer = TfidfVectorizer(
                analyzer="word",
                ngram_range=(1, 2),
                lowercase=True,
                sublinear_tf=True,
                token_pattern=r"(?u)\b\w+\b"
            )

            self.char_vectorizer = TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(2, 5),
                lowercase=True,
                sublinear_tf=True,
                min_df=1
            )

            self.word_matrix = self.word_vectorizer.fit_transform(
                self.document_texts
            )

            self.char_matrix = self.char_vectorizer.fit_transform(
                self.document_texts
            )

            logger.info(
                "Hybrid retrieval indexes created successfully."
            )

            logger.info(
                f"Word index shape: {self.word_matrix.shape}"
            )

            logger.info(
                f"Character index shape: {self.char_matrix.shape}"
            )

        except Exception as e:
            logger.exception(
                f"Failed to build retrieval indexes: {e}"
            )

            self.word_vectorizer = None
            self.char_vectorizer = None
            self.word_matrix = None
            self.char_matrix = None

    @staticmethod
    def _tokenize(text: str) -> Set[str]:
        if not text:
            return set()

        return set(
            re.findall(r"(?u)\w+", text.lower())
        )

    def _calculate_lexical_score(
        self,
        doc_text: str,
        query_tokens: Set[str]
    ) -> float:

        if not query_tokens:
            return 0.0

        doc_tokens = self._tokenize(doc_text)

        overlap = query_tokens.intersection(doc_tokens)

        return len(overlap) / max(1, len(query_tokens))

    def _get_text_similarities(
        self,
        query: str
    ) -> np.ndarray:
        """
        Calculate combined word and character TF-IDF similarity.
        """

        count = len(self.documents)

        scores = np.zeros(count, dtype=np.float32)

        if not query.strip():
            return scores

        if (
            self.word_vectorizer is None
            or self.char_vectorizer is None
            or self.word_matrix is None
            or self.char_matrix is None
        ):
            return scores

        try:
            query_word = self.word_vectorizer.transform(
                [query]
            )

            query_char = self.char_vectorizer.transform(
                [query]
            )

            word_scores = cosine_similarity(
                query_word,
                self.word_matrix
            )[0]

            char_scores = cosine_similarity(
                query_char,
                self.char_matrix
            )[0]

            # Character matching is weighted higher because
            # it handles multilingual text and spelling variations.

            scores = (
                0.35 * word_scores
                + 0.65 * char_scores
            ).astype(np.float32)

            return scores

        except Exception as e:
            logger.error(
                f"Text similarity calculation failed: {e}"
            )

            return scores

    def query(
        self,
        request: RAGQueryRequest
    ) -> RAGQueryResponse:

        if not self.documents:
            return RAGQueryResponse(
                status="empty_knowledge_base",
                query=request.query,
                matched_conditions=[],
                passages=[],
                sources=[],
                total_retrieved=0
            )

        query_text = (
            request.query or ""
        ).strip()

        query_tokens = self._tokenize(query_text)

        matched_conditions = []
        target_indices: Set[int] = set()

        # 1. Condition matching.

        if request.conditions:

            for condition in request.conditions:

                clean_condition = str(
                    condition
                ).lower().strip()

                if not clean_condition:
                    continue

                if clean_condition in self.condition_doc_map:

                    target_indices.update(
                        self.condition_doc_map[clean_condition]
                    )

                    matched_conditions.append(
                        clean_condition
                    )

                else:

                    for cond_key, indices in (
                        self.condition_doc_map.items()
                    ):

                        if (
                            clean_condition in cond_key
                            or cond_key in clean_condition
                        ):

                            target_indices.update(indices)

                            if cond_key not in matched_conditions:
                                matched_conditions.append(
                                    cond_key
                                )

        # 2. Include general guidance.

        for general_condition in [
            "global",
            "symptom_support"
        ]:

            if general_condition in self.condition_doc_map:

                target_indices.update(
                    self.condition_doc_map[general_condition]
                )

        # 3. Candidate selection.

        if target_indices:

            candidate_indices = list(target_indices)

        else:

            candidate_indices = list(
                range(len(self.documents))
            )

        # 4. Category filtering.

        if request.categories:

            categories = {
                str(category).lower().strip()
                for category in request.categories
            }

            candidate_indices = [
                idx
                for idx in candidate_indices
                if str(
                    self.documents[idx].get(
                        "category", ""
                    )
                ).lower().strip() in categories
            ]

        if not candidate_indices:

            return RAGQueryResponse(
                status="success",
                query=request.query,
                matched_conditions=matched_conditions,
                passages=[],
                sources=[],
                total_retrieved=0
            )

        # 5. Calculate word + character similarities.

        text_scores = self._get_text_similarities(
            query_text
        )

        # 6. Hybrid ranking.

        scored_candidates = []

        for idx in candidate_indices:

            doc = self.documents[idx]

            condition = str(
                doc.get("condition", "")
            ).lower().strip()

            content = str(
                doc.get("content", "")
            )

            full_text = self.document_texts[idx]

            lexical_score = self._calculate_lexical_score(
                full_text,
                query_tokens
            )

            text_score = float(
                text_scores[idx]
            )

            condition_score = (
                1.0 if condition in matched_conditions
                else 0.0
            )

            # Hybrid score: normalized to approximately 0-1.

            final_score = (
                0.55 * text_score
                + 0.20 * lexical_score
                + 0.25 * condition_score
            )

            scored_candidates.append(
                (idx, final_score)
            )

        # 7. Rank candidates.

        scored_candidates.sort(
            key=lambda item: item[1],
            reverse=True
        )

        top_k = max(
            1,
            int(request.top_k)
        )

        top_candidates = scored_candidates[:top_k]

        # 8. Construct passages and preserve provenance.

        passages: List[RAGPassage] = []

        sources_used: Dict[str, Dict[str, Any]] = {}

        for idx, score in top_candidates:

            doc = self.documents[idx]

            metadata = doc.get("metadata", {})

            source_doc_ids = metadata.get(
                "source_document_ids", []
            )

            source_id = (
                source_doc_ids[0]
                if source_doc_ids
                else "AYUSH_RESEARCH_PORTAL"
            )

            registry_entry = self.source_registry.get(
                source_id, {}
            )

            source_name = registry_entry.get(
                "source_name",
                metadata.get(
                    "knowledge_origin",
                    "Ministry of AYUSH"
                )
            )

            organization = registry_entry.get(
                "organization",
                "Ministry of AYUSH, Government of India"
            )

            url = registry_entry.get(
                "url",
                "https://arp.ayush.gov.in/"
            )

            passages.append(
                RAGPassage(
                    document_id=doc.get(
                        "document_id",
                        f"doc_{idx}"
                    ),
                    condition=doc.get(
                        "condition",
                        "general"
                    ),
                    category=doc.get(
                        "category",
                        "general"
                    ),
                    content=doc.get(
                        "content",
                        ""
                    ),
                    source_id=source_id,
                    source_name=source_name,
                    organization=organization,
                    url=url,
                    knowledge_type=metadata.get(
                        "knowledge_type",
                        "ayurvedic_guidance"
                    ),
                    knowledge_origin=metadata.get(
                        "knowledge_origin",
                        "AYUSH_CCRAS"
                    ),
                    source_grounded=metadata.get(
                        "source_grounded",
                        True
                    ),
                    similarity_score=round(
                        float(score),
                        4
                    )
                )
            )

            if source_id not in sources_used:

                sources_used[source_id] = {
                    "source_id": source_id,
                    "source_name": source_name,
                    "organization": organization,
                    "url": url
                }

        return RAGQueryResponse(
            status="success",
            query=request.query,
            matched_conditions=matched_conditions,
            passages=passages,
            sources=list(sources_used.values()),
            total_retrieved=len(passages)
        )
