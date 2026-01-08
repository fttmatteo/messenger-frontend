import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { createLogger } from "@/utils/logger"

import "./index.css"
import "./styles/toast.css"
import App from "./App.tsx"

const logger = createLogger('PWA')

// Register service worker for PWA with enhanced callbacks
const updateSW = registerSW({
  immediate: true,
  onOfflineReady() {
    logger.info('App ready to work offline')
    window.dispatchEvent(new CustomEvent('sw-offline-ready'))
  },
  onNeedRefresh() {
    logger.info('New version available')
    window.dispatchEvent(new CustomEvent('sw-need-refresh'))
  },
  onRegisteredSW(swUrl, registration) {
    logger.info('Service Worker registered:', swUrl)
    // Check for updates periodically (every hour)
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    logger.error('Service Worker registration error:', error)
  },
})

// Expose update function globally for NetworkContext to use
window.__updateSW = updateSW

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
