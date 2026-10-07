from __future__ import annotations

from typing import Any


def hybrid_rank(
    semantic_rows: list[dict[str, Any]],
    lexical_rows: list[dict[str, Any]],
    *,
    anchor_category_id: str | None = None,
) -> list[dict[str, Any]]:
    """Fuse vector and full-text rankings with exact-title and category signals."""
    ranked: dict[str, dict[str, Any]] = {}

    for rank, row in enumerate(semantic_rows, start=1):
        item_id = str(row["id"])
        ranked[item_id] = {
            "id": item_id,
            "semanticScore": float(row["semantic_score"]),
            "lexicalScore": 0.0,
            "exactMatch": False,
            "categoryId": row["category_id"],
            "semanticRank": rank,
            "lexicalRank": None,
        }

    for rank, row in enumerate(lexical_rows, start=1):
        item_id = str(row["id"])
        result = ranked.setdefault(
            item_id,
            {
                "id": item_id,
                "semanticScore": 0.0,
                "lexicalScore": 0.0,
                "exactMatch": False,
                "categoryId": row["category_id"],
                "semanticRank": None,
                "lexicalRank": None,
            },
        )
        result["lexicalScore"] = float(row["lexical_score"])
        result["exactMatch"] = bool(row["exact_match"])
        result["lexicalRank"] = rank

    for result in ranked.values():
        semantic_part = (
            0.60 / (20 + result["semanticRank"])
            if result["semanticRank"] is not None
            else 0.0
        )
        lexical_part = (
            0.30 / (20 + result["lexicalRank"])
            if result["lexicalRank"] is not None
            else 0.0
        )
        exact_part = 0.07 if result["exactMatch"] else 0.0
        category_part = (
            0.03
            if anchor_category_id is not None
            and result["categoryId"] == anchor_category_id
            else 0.0
        )
        result["score"] = semantic_part + lexical_part + exact_part + category_part

    return sorted(
        ranked.values(),
        key=lambda row: (
            -row["score"],
            -row["semanticScore"],
            -row["lexicalScore"],
            row["id"],
        ),
    )
