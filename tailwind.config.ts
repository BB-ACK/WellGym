import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#17211f',
        paper: '#f6f8f5',
        mint: '#0f766e',
        coral: '#e9685b',
        amberfit: '#f6b64d',
        saffron: '#efad3f',
        skyfit: '#4f9fd8',
        ocean: '#377fb8'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 33, 31, 0.10)',
        line: 'inset 0 0 0 1px rgba(23, 33, 31, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config
