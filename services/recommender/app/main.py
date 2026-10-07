from __future__ import annotations

import asyncio
import hmac
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import UUID

import asyncpg
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from starlette.concurrency import run_in_threadpool

from .ranking import hybrid_rank
from .validation import validate_recommendation_input, vector_literal

SERVICE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(SERVICE_DIR / ".env")


def database_dsn(value: str) -> str:
    parts = urlsplit(value)
    query = [(key, val) for key, val in parse_qsl(parts.query) if key != "schema"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


class EmbedRequest(BaseModel):
    item_id: UUID | None = Field(default=None, alias="itemId")
    text: str | None = Field(default=None, min_length=1, max_length=12000)
    batch_size: int = Field(default=100, alias="batchSize", ge=1, le=500)


class EmbedResponse(BaseModel):
    indexed_count: int = Field(alias="indexedCount")
    item_id: str | None = Field(default=None, alias="itemId")
    remaining_count: int = Field(default=0, alias="remainingCount")


def model_text(row: asyncpg.Record) -> str:
    return ". ".join(
        str(value).strip()
        for value in (row["title"], row["description"], row["category_name"], row["rules"], row["location"])
        if value and str(value).strip()
    )


def get_api_key() -> str:
    key = os.getenv("RECOMMENDER_API_KEY", "")
    if len(key) < 32:
        raise RuntimeError("RECOMMENDER_API_KEY must contain at least 32 characters.")
    return key


async def require_api_key(
    supplied_key: Annotated[str | None, Header(alias="X-API-Key")] = None,
) -> None:
    expected_key = os.getenv("RECOMMENDER_API_KEY", "")
    if len(expected_key) < 32 or supplied_key is None or not hmac.compare_digest(supplied_key, expected_key):
        raise HTTPException(status_code=401, detail="Invalid service credentials.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required.")
    api_key = get_api_key()
    pool = await asyncpg.create_pool(database_dsn(database_url), min_size=1, max_size=10)
    try:
        async with pool.acquire() as connection:
            extension = await connection.fetchval("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
        if extension is None:
            raise RuntimeError("The PostgreSQL pgvector extension is not installed; apply the recommender migration.")
    except Exception as error:
        await pool.close()
        raise RuntimeError("The PostgreSQL pgvector extension is not installed; apply the recommender migration.") from error

    cache_dir = Path(os.getenv("MODEL_CACHE_DIR", str(SERVICE_DIR / ".model-cache")))
    cache_dir.mkdir(parents=True, exist_ok=True)
    try:
        model = await run_in_threadpool(
            SentenceTransformer,
            os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"),
            device=os.getenv("MODEL_DEVICE", "cpu"),
            cache_folder=str(cache_dir),
        )
    except Exception:
        await pool.close()
        raise
    if model.get_sentence_embedding_dimension() != 384:
        await pool.close()
        raise RuntimeError("Configured model must produce 384-dimensional embeddings.")
    app.state.model = model
    app.state.api_key = api_key
    app.state.pool = pool
    try:
        yield
    finally:
        await app.state.pool.close()


app = FastAPI(title="BorrowNet Recommender", version="1.0.0", lifespan=lifespan)


@app.get("/health")
async def health(request: Request):
    return {"status": "ok", "model": os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")}


async def embed(model: SentenceTransformer, text: str) -> list[float]:
    values = await run_in_threadpool(
        model.encode,
        text,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return [float(value) for value in values]


async def save_embedding(pool: asyncpg.Pool, model: SentenceTransformer, item_id: str, text: str) -> None:
    vector = vector_literal(await embed(model, text))
    async with pool.acquire() as connection:
        result = await connection.execute(
            'UPDATE "Item" SET "embedding" = $2::text::vector WHERE "id" = $1',
            item_id,
            vector,
        )
    if result.endswith(" 0"):
        raise HTTPException(status_code=404, detail="Item not found.")


@app.post("/embed", response_model=EmbedResponse, dependencies=[Depends(require_api_key)])
async def embed_items(payload: EmbedRequest, request: Request):
    pool: asyncpg.Pool = request.app.state.pool
    model: SentenceTransformer = request.app.state.model
    if payload.item_id:
        item_id = str(payload.item_id)
        if payload.text:
            text = payload.text
        else:
            async with pool.acquire() as connection:
                row = await connection.fetchrow(
                    'SELECT i."title", i."description", i."rules", i."location", c."name" AS category_name '
                    'FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" WHERE i."id" = $1',
                    item_id,
                )
            if row is None:
                raise HTTPException(status_code=404, detail="Item not found.")
            text = model_text(row)
        await save_embedding(pool, model, item_id, text)
        return EmbedResponse(indexedCount=1, itemId=item_id)

    async with pool.acquire() as connection:
        rows = await connection.fetch(
            'SELECT i."id", i."title", i."description", i."rules", i."location", c."name" AS category_name '
            'FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" '
            'WHERE i."status" = \'ACTIVE\' AND i."embedding" IS NULL '
            'ORDER BY i."createdAt" ASC LIMIT $1',
            payload.batch_size,
        )
        if rows:
            vectors = await run_in_threadpool(
                model.encode,
                [model_text(row) for row in rows],
                batch_size=min(32, payload.batch_size),
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            updates = [(str(row["id"]), vector_literal(vector)) for row, vector in zip(rows, vectors, strict=True)]
            await connection.executemany(
                'UPDATE "Item" SET "embedding" = $2::text::vector WHERE "id" = $1',
                updates,
            )
        remaining = await connection.fetchval(
            'SELECT count(*) FROM "Item" WHERE "status" = \'ACTIVE\' AND "embedding" IS NULL'
        )
    return EmbedResponse(indexedCount=len(rows), remainingCount=remaining)


def recommendation_filters(
    category_slug: str | None,
    condition: str | None,
    excluded_item_id: str | None,
) -> str:
    return (
        'i."status" = \'ACTIVE\' '
        'AND ($2::text IS NULL OR c."slug" = $2) '
        'AND ($3::text IS NULL OR i."condition"::text = $3) '
        'AND ($4::text IS NULL OR i."id" <> $4)'
    )


@app.get("/recommendations", dependencies=[Depends(require_api_key)])
async def get_recommendations(
    request: Request,
    q: Annotated[str | None, Query(min_length=2, max_length=500)] = None,
    item_id: Annotated[UUID | None, Query(alias="itemId")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 6,
    offset: Annotated[int, Query(ge=0, le=5000)] = 0,
    category_slug: Annotated[str | None, Query(alias="categorySlug", max_length=100)] = None,
    condition: Annotated[Literal["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"] | None, Query()] = None,
):
    try:
        normalized_query = validate_recommendation_input(q, item_id)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    pool: asyncpg.Pool = request.app.state.pool
    model: SentenceTransformer = request.app.state.model
    anchor = None
    if item_id:
        async with pool.acquire() as connection:
            anchor = await connection.fetchrow(
                'SELECT i."id", i."title", i."description", i."rules", i."location", i."categoryId", '
                'c."name" AS category_name, i."embedding"::text AS embedding '
                'FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" '
                'WHERE i."id" = $1 AND i."status" <> \'REMOVED\'',
                str(item_id),
            )
        if anchor is None:
            raise HTTPException(status_code=404, detail="Item not found.")
    search_text = normalized_query or model_text(anchor)
    anchor_category_id = str(anchor["categoryId"]) if anchor else None
    excluded_item_id = str(item_id) if item_id else None
    query_vector = anchor["embedding"] if anchor and anchor["embedding"] else None
    if not query_vector:
        query_vector = vector_literal(await embed(model, search_text))

    candidate_limit = min(10000, max(200, offset + limit))
    filters = recommendation_filters(category_slug, condition, excluded_item_id)
    semantic_sql = (
        'SELECT i."id", i."categoryId" AS category_id, '
        '1 - (i."embedding" <=> $1::text::vector) AS semantic_score '
        'FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" '
        f'WHERE {filters} AND i."embedding" IS NOT NULL '
        'AND i."embedding" <=> $1::text::vector <= 0.75 '
        'ORDER BY i."embedding" <=> $1::text::vector LIMIT $5'
    )
    lexical_sql = (
        'SELECT i."id", i."categoryId" AS category_id, '
        'ts_rank_cd(to_tsvector(\'english\', concat_ws(\' \', i."title", i."description", i."location", i."rules")), '
        'plainto_tsquery(\'english\', $1)) AS lexical_score, '
        'strpos(lower(i."title"), lower($1)) > 0 AS exact_match '
        'FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" '
        f'WHERE {filters} AND (strpos(lower(i."title"), lower($1)) > 0 OR '
        'to_tsvector(\'english\', concat_ws(\' \', i."title", i."description", i."location", i."rules")) '
        '@@ plainto_tsquery(\'english\', $1)) '
        'ORDER BY exact_match DESC, lexical_score DESC, i."createdAt" DESC LIMIT $5'
    )
    count_sql = (
        'SELECT count(*) FROM "Item" i JOIN "Category" c ON c."id" = i."categoryId" '
        'WHERE i."status" = \'ACTIVE\' '
        'AND ($3::text IS NULL OR c."slug" = $3) '
        'AND ($4::text IS NULL OR i."condition"::text = $4) '
        'AND ($5::text IS NULL OR i."id" <> $5) '
        'AND ((i."embedding" IS NOT NULL AND i."embedding" <=> $1::text::vector <= 0.75) '
        'OR strpos(lower(i."title"), lower($2)) > 0 OR '
        'to_tsvector(\'english\', concat_ws(\' \', i."title", i."description", i."location", i."rules")) '
        '@@ plainto_tsquery(\'english\', $2))'
    )
    async with pool.acquire() as semantic_connection, pool.acquire() as lexical_connection:
        semantic_rows, lexical_rows = await asyncio.gather(
            semantic_connection.fetch(semantic_sql, query_vector, category_slug, condition, excluded_item_id, candidate_limit),
            lexical_connection.fetch(lexical_sql, search_text, category_slug, condition, excluded_item_id, candidate_limit),
        )
        total = await semantic_connection.fetchval(count_sql, query_vector, search_text, category_slug, condition, excluded_item_id)
    ranked = hybrid_rank(semantic_rows, lexical_rows, anchor_category_id=anchor_category_id)
    page = ranked[offset : offset + limit]
    return {
        "items": [
            {"id": row["id"], "score": row["score"], "semanticScore": row["semanticScore"], "lexicalScore": row["lexicalScore"]}
            for row in page
        ],
        "total": total,
        "offset": offset,
        "limit": limit,
    }
