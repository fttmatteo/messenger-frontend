import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { createLogger } from "@/utils/logger"

import "./index.css"
import "./styles/toast.css"
import App from "./App.tsx"

/**
 * Punto de entrada principal de la aplicación React.
 * Configura el Service Worker para capacidades PWA y renderiza el componente raíz.
 */
import { isNative } from "@/lib/capacitor"

const logger = createLogger('PWA')

// Registrar el Service Worker para PWA con callbacks mejorados (Solo si no es app nativa)

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined = undefined;

if (isNative()) {
  logger.info('App ejecutándose en modo nativo (Capacitor), omitiendo Service Worker');
  // Safe area se maneja nativamente en MainActivity.java via WindowInsetsCompat
  document.documentElement.classList.add('native-app');
} else {
  // Configuración Web/PWA original
  updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      logger.info('Aplicación lista para trabajar sin conexión')
      window.dispatchEvent(new CustomEvent('sw-offline-ready'))
    },
    onNeedRefresh() {
      logger.info('Nueva versión disponible')
      window.dispatchEvent(new CustomEvent('sw-need-refresh'))
    },
    onRegisteredSW(swUrl, registration) {
      logger.info('Service Worker registrado:', swUrl)
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      logger.error('Error en el registro del Service Worker:', error)
    },
  })
}

// Exponer la función de actualización globalmente para uso de NetworkContext
(window as Window & typeof globalThis & { __updateSW?: typeof updateSW }).__updateSW = updateSW;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
