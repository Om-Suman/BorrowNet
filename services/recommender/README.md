# BorrowNet Recommendation Service

This Python service embeds listing text with `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions), stores vectors in PostgreSQL through pgvector, and combines cosine similarity, PostgreSQL full-text ranking, exact-title matches, and category affinity.

## Setup

1. Install PostgreSQL with the pgvector extension available to the server.
2. Apply the API Prisma migrations after installing pgvector:

   ```powershell
   cd apps/api
   npm run db:migrate
   ```

3. Create a shared random API key of at least 32 characters. Set the same `RECOMMENDER_API_KEY` in `apps/api/.env` and `services/recommender/.env`.
4. Copy `.env.example` to `.env` and set `DATABASE_URL`, `RECOMMENDER_API_KEY`, and optionally `MODEL_CACHE_DIR`.
5. Create a Python 3.11 or 3.12 environment, then install and start the service:

   ```powershell
   cd services/recommender
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

The first startup downloads the model into the configured cache. To embed existing active listings, call `POST /embed` with the shared `X-API-Key` header and `{}` repeatedly until `remainingCount` is zero. New and edited listings submit their own embedding through the Express API.

## Internal endpoints

- `POST /embed` with `{ "itemId": "uuid", "text": "listing text" }` refreshes one vector. With `{ "batchSize": 100 }` it backfills active listings that do not yet have vectors.
- `GET /recommendations?q=playstation&limit=6&offset=0` returns hybrid-ranked listing IDs and scores.
- `GET /recommendations?itemId=uuid&limit=6` returns listings related to an existing item.
- `GET /health` reports service readiness.

The Express API exposes the public, envelope-wrapped `GET /api/v1/recommendations/related` endpoint and uses the semantic service to order catalog search results. If the recommender is offline, ordinary catalog text search retains its lexical fallback; the recommendations endpoint reports service unavailability.

Run the model-independent Python tests with `python -m unittest discover -s tests`.
