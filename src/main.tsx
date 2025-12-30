import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"

import "./index.css"
import App from "./App.tsx"

// Register service worker for PWA with enhanced callbacks
const updateSW = registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('PWA: App ready to work offline')
    window.dispatchEvent(new CustomEvent('sw-offline-ready'))
  },
  onNeedRefresh() {
    console.log('PWA: New version available')
    window.dispatchEvent(new CustomEvent('sw-need-refresh'))
  },
  onRegisteredSW(swUrl, registration) {
    console.log('PWA: Service Worker registered:', swUrl)
    // Check for updates periodically (every hour)
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('PWA: Service Worker registration error:', error)
  },
})

// Expose update function globally for NetworkContext to use
window.__updateSW = updateSW

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
