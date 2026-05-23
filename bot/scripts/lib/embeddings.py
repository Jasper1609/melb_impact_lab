"""OpenAI embedding wrapper.

Wraps the OpenAI Embeddings API behind a single function so the rest of the
codebase doesn't depend on the SDK shape. Defaults to text-embedding-3-small
(1536 dims) — override via OPENAI_EMBEDDING_MODEL in .env to use the legacy
text-embedding-ada-002 model or any other compatible model.
"""

from __future__ import annotations

import os
from typing import Sequence

from openai import OpenAI

_DEFAULT_MODEL = "text-embedding-3-small"

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Copy .env.example to .env and fill it in."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def embed(texts: Sequence[str], *, model: str | None = None) -> list[list[float]]:
    """Embed a batch of texts. Returns one float vector per input text."""
    if not texts:
        return []
    model = model or os.environ.get("OPENAI_EMBEDDING_MODEL", _DEFAULT_MODEL)
    response = _get_client().embeddings.create(model=model, input=list(texts))
    # API returns results in the same order as the input.
    return [item.embedding for item in response.data]


def embed_one(text: str, *, model: str | None = None) -> list[float]:
    """Convenience wrapper for embedding a single string."""
    return embed([text], model=model)[0]
