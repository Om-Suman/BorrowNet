# BorrowNet

BorrowNet is a peer-to-peer resource-sharing platform built as a JavaScript modular monolith.

For continuation across developers or coding platforms, read:

- [AGENTS.md](AGENTS.md) for repository-wide agent instructions
- [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for architecture and current state
- [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for ordered work and acceptance criteria
- [docs/borrowNet_buildPlan.md](docs/borrowNet_buildPlan.md) for deferred product requirements

## Phase 1 Foundation

The repository currently contains the project foundation:

- Express API in `apps/api`
- React and Vite frontend in `apps/web`
- JavaScript and JSX only
- Central API environment validation
- API health and JSON 404 endpoints
- React Router shell for the initial Phase 1 routes
- Prisma PostgreSQL schema and initial User migration
- Workspace scripts for development, checks, builds, and tests

## Local Setup

Requirements: Node.js 20 or newer, PostgreSQL, and Redis.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `apps/api/.env.example` to `apps/api/.env` and replace the placeholder secrets.

3. Apply the Prisma migration after PostgreSQL is running:

   ```bash
   npm run db:migrate --workspace apps/api -- --name init
   ```

4. Start the API and frontend together:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:4000` and the frontend at `http://localhost:5173`.

## Validation

```bash
npm run check
npm test
npm run db:validate --workspace apps/api
npm run db:generate --workspace apps/api
```

The API health endpoint is available at `GET /health`.
