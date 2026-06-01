import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('WellGym is ready for offline use.')
  },
  onNeedRefresh() {
    console.info('A fresh WellGym version is available.')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
