from __future__ import annotations

import math
from collections.abc import Sequence
from uuid import UUID


def vector_literal(values: Sequence[float]) -> str:
    if len(values) != 384:
        raise ValueError("Embeddings must contain exactly 384 values.")
    numbers = [float(value) for value in values]
    if not all(math.isfinite(value) for value in numbers):
        raise ValueError("Embedding values must be finite numbers.")
    return "[" + ",".join(f"{value:.8f}" for value in numbers) + "]"


def validate_recommendation_input(query: str | None, item_id: str | UUID | None) -> str | None:
    normalized = query.strip() if query else None
    if not normalized and not item_id:
        raise ValueError("Provide q or itemId.")
    if normalized is not None and not 2 <= len(normalized) <= 500:
        raise ValueError("q must contain between 2 and 500 characters.")
    return normalized
