import unittest

from app.ranking import hybrid_rank
from app.validation import validate_recommendation_input, vector_literal


class HybridRankingTests(unittest.TestCase):
    def test_merges_semantic_and_lexical_results(self):
        rows = hybrid_rank(
            [{"id": "semantic", "category_id": "camera", "semantic_score": 0.88}],
            [{"id": "lexical", "category_id": "tools", "lexical_score": 0.72, "exact_match": True}],
        )
        self.assertEqual({row["id"] for row in rows}, {"semantic", "lexical"})
        self.assertGreater(rows[0]["score"], rows[1]["score"])

    def test_combined_signal_outscores_one_signal(self):
        rows = hybrid_rank(
            [{"id": "combined", "category_id": "same", "semantic_score": 0.82}],
            [{"id": "combined", "category_id": "same", "lexical_score": 0.4, "exact_match": False}],
            anchor_category_id="same",
        )
        self.assertEqual(len(rows), 1)
        self.assertGreater(rows[0]["score"], 0.05)

    def test_empty_candidates_are_supported(self):
        self.assertEqual(hybrid_rank([], []), [])

    def test_embedding_vectors_are_validated_and_serialized(self):
        serialized = vector_literal([0.0] * 384)
        self.assertTrue(serialized.startswith("[0.00000000,"))
        with self.assertRaises(ValueError):
            vector_literal([0.0] * 383)
        with self.assertRaises(ValueError):
            vector_literal([float("nan")] + [0.0] * 383)

    def test_recommendation_search_requires_a_query_or_item(self):
        self.assertEqual(validate_recommendation_input("  PlayStation  ", None), "PlayStation")
        self.assertIsNone(validate_recommendation_input(None, "item-id"))
        with self.assertRaises(ValueError):
            validate_recommendation_input(" ", None)


if __name__ == "__main__":
    unittest.main()
