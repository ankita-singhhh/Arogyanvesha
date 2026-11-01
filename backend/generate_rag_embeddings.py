
import os
import json
import time
import numpy as np

from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parent.parent

load_dotenv(ROOT / "backend" / ".env")

OUTPUT = (
    ROOT / "ayurvedic_knowledge" /
    "rag_embeddings_gemini_v1.npy"
)

DOCUMENTS = (
    ROOT / "ayurvedic_knowledge" /
    "rag_documents_provenance_aware_v4.json"
)

MODEL = "gemini-embedding-2"
DIMENSIONS = 768

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY not found in backend/.env"
    )

client = genai.Client(api_key=api_key)

print("Loading existing RAG documents...")

with open(DOCUMENTS, "r", encoding="utf-8") as f:
    documents = json.load(f)

if not documents:
    raise ValueError("No RAG documents found.")

texts = []

for doc in documents:
    text = " ".join([
        str(doc.get("condition", "")),
        str(doc.get("category", "")),
        str(doc.get("content", ""))
    ]).strip()

    if not text:
        raise ValueError(
            f"Empty document: {doc.get('document_id')}"
        )

    texts.append(text)

print("Documents:", len(texts))
print("Model:", MODEL)

vectors = []

for index, text in enumerate(texts):

    for attempt in range(5):
        try:
            response = client.models.embed_content(
                model=MODEL,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=DIMENSIONS
                )
            )

            vector = response.embeddings[0].values

            if len(vector) != DIMENSIONS:
                raise ValueError(
                    f"Unexpected dimensions: {len(vector)}"
                )

            vectors.append(vector)

            print(
                f"Embedded {index + 1}/{len(texts)}"
            )

            break

        except Exception as error:

            if attempt == 4:
                raise RuntimeError(
                    f"Failed on document {index + 1}: {error}"
                )

            wait = 2 ** attempt

            print(
                f"Retry {attempt + 1}/5 after {wait}s: {error}"
            )

            time.sleep(wait)

    # Small delay between API calls.
    time.sleep(0.2)

embeddings = np.asarray(
    vectors,
    dtype=np.float32
)

norms = np.linalg.norm(
    embeddings,
    axis=1,
    keepdims=True
)

embeddings = embeddings / np.maximum(norms, 1e-12)

if embeddings.shape != (len(documents), DIMENSIONS):
    raise ValueError(
        f"Invalid final shape: {embeddings.shape}"
    )

np.save(OUTPUT, embeddings)

print("\nSUCCESS!")
print("Embedding shape:", embeddings.shape)
print("Data type:", embeddings.dtype)
print("First vector norm:", np.linalg.norm(embeddings[0]))
print("Saved at:", OUTPUT)
