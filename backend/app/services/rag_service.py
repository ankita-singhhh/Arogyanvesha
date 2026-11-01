
import os
import json
import re
import time

from pathlib import Path
from typing import List, Dict, Any, Optional, Set

import numpy as np

from dotenv import load_dotenv
from google import genai
from google.genai import types

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

    EMBEDDING_MODEL = "gemini-embedding-2"
    EMBEDDING_DIMENSIONS = 768

    def __init__(self):

        self.documents: List[Dict[str, Any]] = []

        self.embeddings: Optional[np.ndarray] = None

        self.source_registry: Dict[str, Dict[str, Any]] = {}

        self.condition_doc_map: Dict[str, List[int]] = {}

        self.document_texts: List[str] = []

        self.word_vectorizer = None
        self.char_vectorizer = None

        self.word_matrix = None
        self.char_matrix = None

        self.embedding_client = None

        self._load_knowledge_base()

        self._initialize_embedding_client()

        self._build_retrieval_index()

    @classmethod
    def get_instance(cls):

        if cls._instance is None:
            cls._instance = cls()

        return cls._instance

    # --------------------------------------------------
    # 1. LOAD KNOWLEDGE BASE
    # --------------------------------------------------

    def _load_knowledge_base(self):

        kb_dir = settings.KNOWLEDGE_BASE_DIR

        doc_path = os.path.join(
            kb_dir,
            settings.RAG_DOCUMENTS_FILE
        )

        emb_path = os.path.join(
            kb_dir,
            settings.RAG_EMBEDDINGS_FILE
        )

        registry_path = os.path.join(
            kb_dir,
            settings.SOURCE_REGISTRY_FILE
        )

        logger.info(
            f"Loading RAG documents: {doc_path}"
        )

        if not os.path.exists(doc_path):

            logger.error(
                "RAG documents file not found."
            )

            return

        try:

            with open(
                doc_path,
                "r",
                encoding="utf-8"
            ) as f:

                self.documents = json.load(f)

            logger.info(
                f"Loaded {len(self.documents)} RAG documents."
            )

        except Exception as e:

            logger.exception(
                f"Document loading failed: {e}"
            )

            return

        # Load Gemini document embeddings.

        logger.info(
            f"Loading embeddings: {emb_path}"
        )

        if os.path.exists(emb_path):

            try:

                embeddings = np.load(
                    emb_path,
                    allow_pickle=False
                )

                expected_shape = (
                    len(self.documents),
                    self.EMBEDDING_DIMENSIONS
                )

                if embeddings.shape != expected_shape:

                    raise ValueError(
                        f"Expected embedding shape "
                        f"{expected_shape}, "
                        f"received {embeddings.shape}"
                    )

                embeddings = embeddings.astype(
                    np.float32
                )

                norms = np.linalg.norm(
                    embeddings,
                    axis=1,
                    keepdims=True
                )

                self.embeddings = (
                    embeddings /
                    np.maximum(norms, 1e-12)
                )

                logger.info(
                    f"Gemini embeddings loaded: "
                    f"{self.embeddings.shape}"
                )

            except Exception as e:

                logger.exception(
                    f"Embedding loading failed: {e}"
                )

                self.embeddings = None

        else:

            logger.error(
                f"Embedding file not found: {emb_path}"
            )

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
                    f"Loaded {len(self.source_registry)} source records."
                )

            except Exception as e:

                logger.exception(
                    f"Source registry loading failed: {e}"
                )

        # Build condition index.

        self.condition_doc_map.clear()

        for idx, doc in enumerate(self.documents):

            condition = str(
                doc.get("condition", "general")
            ).lower().strip()

            self.condition_doc_map.setdefault(
                condition,
                []
            ).append(idx)

    # --------------------------------------------------
    # 2. GEMINI CLIENT INITIALIZATION
    # --------------------------------------------------

    def _initialize_embedding_client(self):

        try:

            # rag_service.py is inside backend/app/services.
            # parents[2] resolves to backend directory.

            backend_dir = Path(__file__).resolve().parents[2]

            env_path = backend_dir / ".env"

            load_dotenv(
                dotenv_path=env_path,
                override=False
            )

            api_key = (
                os.getenv("GEMINI_API_KEY")
                or os.getenv("GOOGLE_API_KEY")
            )

            if not api_key:

                raise RuntimeError(
                    f"Gemini API key not found. "
                    f"Checked: {env_path}"
                )

            self.embedding_client = genai.Client(
                api_key=api_key,
                http_options={
                    "timeout": settings.GEMINI_REQUEST_TIMEOUT_MS,
                    "retry_options": {"attempts": settings.GEMINI_RETRY_ATTEMPTS},
                },
            )

            logger.info(
                "Gemini embedding client initialized successfully."
            )

        except Exception as e:

            self.embedding_client = None

            logger.exception(
                f"Gemini client initialization failed: {e}"
            )

    # --------------------------------------------------
    # 3. BUILD WORD AND CHARACTER RETRIEVAL INDEX
    # --------------------------------------------------

    def _build_retrieval_index(self):

        if not self.documents:

            logger.warning(
                "No documents available for indexing."
            )

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

            combined_text = (
                f"{condition} {category} {content}"
            ).strip()

            self.document_texts.append(
                combined_text
            )

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

            self.word_matrix = (
                self.word_vectorizer.fit_transform(
                    self.document_texts
                )
            )

            self.char_matrix = (
                self.char_vectorizer.fit_transform(
                    self.document_texts
                )
            )

            logger.info(
                "Word and character retrieval indexes created."
            )

            logger.info(
                f"Word matrix: {self.word_matrix.shape}"
            )

            logger.info(
                f"Character matrix: {self.char_matrix.shape}"
            )

        except Exception as e:

            logger.exception(
                f"Retrieval index creation failed: {e}"
            )

            self.word_vectorizer = None
            self.char_vectorizer = None

            self.word_matrix = None
            self.char_matrix = None

    # --------------------------------------------------
    # 4. TEXT TOKENIZATION
    # --------------------------------------------------

    @staticmethod
    def _tokenize(text: str) -> Set[str]:

        if not text:
            return set()

        return set(
            re.findall(
                r"(?u)\w+",
                text.lower()
            )
        )

    # --------------------------------------------------
    # 5. LEXICAL MATCHING
    # --------------------------------------------------

    def _calculate_lexical_score(
        self,
        doc_text: str,
        query_tokens: Set[str]
    ) -> float:

        if not query_tokens:
            return 0.0

        doc_tokens = self._tokenize(
            doc_text
        )

        overlap = query_tokens.intersection(
            doc_tokens
        )

        return (
            len(overlap) /
            max(1, len(query_tokens))
        )

    # --------------------------------------------------
    # 6. GEMINI SEMANTIC EMBEDDING
    # --------------------------------------------------

    def _get_semantic_score(
        self,
        query: str
    ) -> Optional[np.ndarray]:

        if (
            self.embedding_client is None
            or self.embeddings is None
        ):

            return None

        try:

            started_at = time.perf_counter()
            response = (
                self.embedding_client.models.embed_content(
                    model=self.EMBEDDING_MODEL,
                    contents=query,
                    config=types.EmbedContentConfig(
                        output_dimensionality=self.EMBEDDING_DIMENSIONS
                    )
                )
            )

            if not response.embeddings:

                logger.warning(
                    "Gemini returned empty query embeddings."
                )

                return None

            query_vector = np.asarray(
                response.embeddings[0].values,
                dtype=np.float32
            )

            if query_vector.shape != (
                self.EMBEDDING_DIMENSIONS,
            ):

                logger.error(
                    f"Unexpected query embedding shape: "
                    f"{query_vector.shape}"
                )

                return None

            norm = np.linalg.norm(
                query_vector
            )

            if norm <= 1e-12:

                return None

            query_vector = (
                query_vector / norm
            )

            # Both vectors are normalized.
            # Dot product equals cosine similarity.

            semantic_scores = np.dot(
                self.embeddings,
                query_vector
            )

            logger.info(
                "Analysis timing step=rag_semantic_embedding outcome=success duration_ms=%d",
                int((time.perf_counter() - started_at) * 1000),
            )
            return semantic_scores.astype(
                np.float32
            )

        except Exception as e:

            logger.warning(
                "Analysis timing step=rag_semantic_embedding outcome=lexical_fallback error_type=%s",
                type(e).__name__,
            )

            return None

    # --------------------------------------------------
    # 7. WORD + CHARACTER TF-IDF SCORES
    # --------------------------------------------------

    def _get_lexical_scores(
        self,
        query: str
    ) -> np.ndarray:

        count = len(self.documents)

        scores = np.zeros(
            count,
            dtype=np.float32
        )

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

            query_word = (
                self.word_vectorizer.transform(
                    [query]
                )
            )

            query_char = (
                self.char_vectorizer.transform(
                    [query]
                )
            )

            word_scores = cosine_similarity(
                query_word,
                self.word_matrix
            )[0]

            char_scores = cosine_similarity(
                query_char,
                self.char_matrix
            )[0]

            query_tokens = self._tokenize(
                query
            )

            for idx, text in enumerate(
                self.document_texts
            ):

                overlap_score = (
                    self._calculate_lexical_score(
                        text,
                        query_tokens
                    )
                )

                scores[idx] = (
                    0.25 * word_scores[idx]
                    + 0.35 * char_scores[idx]
                    + 0.40 * overlap_score
                )

            return scores

        except Exception as e:

            logger.exception(
                f"Lexical scoring failed: {e}"
            )

            return scores

    # --------------------------------------------------
    # 8. MAIN RAG QUERY
    # --------------------------------------------------

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

        query_tokens = self._tokenize(
            query_text
        )

        matched_conditions = []

        target_indices: Set[int] = set()

        # ----------------------------------------------
        # 8.1 CONDITION MATCHING
        # ----------------------------------------------

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

                    if clean_condition not in matched_conditions:

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

                            target_indices.update(
                                indices
                            )

                            if cond_key not in matched_conditions:

                                matched_conditions.append(
                                    cond_key
                                )

        # ----------------------------------------------
        # 8.2 GENERAL GUIDANCE
        # ----------------------------------------------

        for general_condition in [
            "global",
            "symptom_support"
        ]:

            if general_condition in self.condition_doc_map:

                target_indices.update(
                    self.condition_doc_map[general_condition]
                )

        # ----------------------------------------------
        # 8.3 CANDIDATE SELECTION
        # ----------------------------------------------

        if target_indices:

            candidate_indices = list(
                target_indices
            )

        else:

            candidate_indices = list(
                range(len(self.documents))
            )

        # ----------------------------------------------
        # 8.4 CATEGORY FILTER
        # ----------------------------------------------

        if request.categories:

            category_set = {
                str(category).lower().strip()
                for category in request.categories
            }

            candidate_indices = [

                idx
                for idx in candidate_indices

                if str(
                    self.documents[idx].get(
                        "category",
                        ""
                    )
                ).lower().strip() in category_set

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

        # ----------------------------------------------
        # 8.5 SEMANTIC + LEXICAL SCORING
        # ----------------------------------------------

        semantic_scores = self._get_semantic_score(
            query_text
        )

        lexical_scores = self._get_lexical_scores(
            query_text
        )

        scored_candidates = []

        # ----------------------------------------------
        # 8.6 HYBRID RANKING
        # ----------------------------------------------

        for idx in candidate_indices:

            doc = self.documents[idx]

            condition = str(
                doc.get("condition", "")
            ).lower().strip()

            full_text = self.document_texts[idx]

            lexical_overlap = (
                self._calculate_lexical_score(
                    full_text,
                    query_tokens
                )
            )

            lexical_score = float(
                lexical_scores[idx]
            )

            condition_score = (
                1.0
                if condition in matched_conditions
                else 0.0
            )

            if semantic_scores is not None:

                semantic_score = float(
                    semantic_scores[idx]
                )

                semantic_normalized = (
                    semantic_score + 1.0
                ) / 2.0

                final_score = (
                    0.65 * semantic_normalized
                    + 0.20 * lexical_score
                    + 0.10 * lexical_overlap
                    + 0.05 * condition_score
                )

            else:

                # Fallback when Gemini API is unavailable.

                final_score = (
                    0.65 * lexical_score
                    + 0.25 * lexical_overlap
                    + 0.10 * condition_score
                )

            scored_candidates.append(
                (idx, float(final_score))
            )

        # ----------------------------------------------
        # 8.7 SORT AND TOP K
        # ----------------------------------------------

        scored_candidates.sort(
            key=lambda item: item[1],
            reverse=True
        )

        top_k = max(
            1,
            int(request.top_k)
        )

        top_candidates = (
            scored_candidates[:top_k]
        )

        # ----------------------------------------------
        # 8.8 BUILD PASSAGES AND SOURCES
        # ----------------------------------------------

        passages: List[RAGPassage] = []

        sources_used: Dict[str, Dict[str, Any]] = {}

        for idx, score in top_candidates:

            doc = self.documents[idx]

            metadata = doc.get(
                "metadata",
                {}
            )

            source_doc_ids = metadata.get(
                "source_document_ids",
                []
            )

            source_id = (
                source_doc_ids[0]
                if source_doc_ids
                else "AYUSH_RESEARCH_PORTAL"
            )

            registry_entry = self.source_registry.get(
                source_id,
                {}
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

        # ----------------------------------------------
        # 8.9 FINAL RESPONSE
        # ----------------------------------------------

        return RAGQueryResponse(
            status="success",
            query=request.query,
            matched_conditions=matched_conditions,
            passages=passages,
            sources=list(
                sources_used.values()
            ),
            total_retrieved=len(passages)
        )
