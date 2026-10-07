CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Item" ADD COLUMN "embedding" vector(384);

CREATE INDEX "Item_embedding_hnsw_idx"
ON "Item" USING hnsw ("embedding" vector_cosine_ops)
WHERE "embedding" IS NOT NULL;
