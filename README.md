# WellGym


AI 서비스 기획서 기반 헬스 운동 기록 PWA와 이를 지원하는 백엔드 API입니다.

## Project Structure

- `./`: Vite + React + TypeScript PWA frontend
- `./backend`: Express + TypeScript + Prisma backend API

## Frontend

```powershell
AI 서비스 기획서 기반 헬스 운동 기록 PWA 프론트엔드입니다.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand
- vite-plugin-pwa

## Scripts

```bash
npm install
npm run dev
npm run build
```

Frontend default URL: `http://localhost:5173`

Set the API endpoint in `.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
docker compose up -d
npm run prisma:migrate
npm run dev
```

Backend default URL: `http://localhost:4000`

Configure allowed frontend origins with `CORS_ORIGIN` in `backend/.env`, separated by commas.

## Backend Environment

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: random secret with at least 32 characters
- `OPENAI_API_KEY`: required for AI diet and feedback APIs
- `OPENAI_MODEL`: defaults to `gpt-4o-2024-08-06`
- `MEMORY_AUTH_STORE`: set `true` for local auth testing without DB-backed sessions

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

## Full Test Flow

1. Start backend in `backend/`.
2. Start frontend at the repository root.
3. Sign up or log in from the frontend.
4. Save an inbody record.
5. Save a workout log.
6. Refresh and confirm records are loaded from the API.
7. Set `OPENAI_API_KEY`, then test AI diet and workout feedback.
## PWA

- 앱 이름: 헬스 운동 기록 앱
- Standalone display mode
- 192x192, 512x512 maskable icons
- Workbox service worker with offline-ready static assets and runtime caching
- Zustand persisted local store for offline workout and inbody entries
