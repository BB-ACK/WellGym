import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: '헬스 운동 기록 앱',
        short_name: 'WellGym',
        description: '운동 기록, 인바디, 식단 추천을 한 번에 관리하는 모바일 PWA',
        theme_color: '#0f766e',
        background_color: '#f6f8f5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ko-KR',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheName: 'wellgym-pages', networkTimeoutSeconds: 3 }
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker', 'image', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'wellgym-assets' }
          },
          {
            urlPattern: ({ request }) => request.url.includes('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'wellgym-api', networkTimeoutSeconds: 3 }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ]
})
