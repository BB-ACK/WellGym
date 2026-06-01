# WellGym

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

## PWA

- 앱 이름: 헬스 운동 기록 앱
- Standalone display mode
- 192x192, 512x512 maskable icons
- Workbox service worker with offline-ready static assets and runtime caching
- Zustand persisted local store for offline workout and inbody entries
