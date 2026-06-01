import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#15211f',
        mint: '#0f766e',
        coral: '#ef6f61',
        amberfit: '#f6b64d',
        skyfit: '#4f9fd8'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(19, 34, 31, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config
