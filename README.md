# WellGym API

AI service backend for workout logs, inbody history, AI diet planning, and AI workout feedback.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- OpenAI Chat Completions Structured Outputs
- JWT with database-backed login sessions

## Setup

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d
npm run prisma:migrate
npm run dev
```

The default API server runs at `http://localhost:4000`. Configure frontend origins with `CORS_ORIGIN` in `.env`, separated by commas.

## Environment

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: random secret with at least 32 characters
- `OPENAI_API_KEY`: required for AI diet and feedback APIs
- `OPENAI_MODEL`: defaults to `gpt-4o-2024-08-06`

## Main Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/workout/logs`
- `GET /api/workout/logs?from=2026-06-01&to=2026-06-30`
- `POST /api/inbody`
- `GET /api/inbody`
- `GET /api/inbody/latest`
- `POST /api/ai/diet`
- `POST /api/ai/feedback`

Protected APIs require `Authorization: Bearer <token>`.

## AI Response Contract

AI APIs use OpenAI Structured Outputs with `response_format.type = "json_schema"` and `strict = true`, so the frontend receives parse-ready JSON objects.
