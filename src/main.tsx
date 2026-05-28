import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { createLogger } from "@/shared/utils/logger"

import "./index.css"
import "./styles/toast.css"
import App from "./App.tsx"

/**
 * Punto de entrada principal de la aplicación React.
 * Configura el Service Worker para capacidades PWA y renderiza el componente raíz.
 */
import { isNative } from "@/shared/lib/capacitor"

const logger = createLogger('PWA')

window.addEventListener('vite:preloadError', (event) => {
  logger.error('Error de precarga de Vite detectado. Recargando aplicación...', event);
  window.location.reload();
});

window.addEventListener('error', (event) => {
  const errorText = event.message || '';
  const isChunkError = /Failed to fetch dynamically imported module|Loading chunk/i.test(errorText);
  if (isChunkError) {
    logger.error('Fallo en carga de módulo dinámico. Recargando página...', event);
    window.location.reload();
  }
}, true);


let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined = undefined;

if (isNative()) {
  logger.info('App ejecutándose en modo nativo (Capacitor), omitiendo Service Worker');
  document.documentElement.classList.add('native-app');
} else {
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
          if (document.visibilityState === 'visible') {
            logger.info('Verificando actualización de Service Worker por intervalo de 5 min...');
            registration.update().catch(err => logger.error('Error en actualización por intervalo:', err));
          }
        }, 5 * 60 * 1000);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            logger.info('Verificando actualización de Service Worker por cambio de visibilidad...');
            registration.update().catch(err => logger.error('Error en actualización por visibilidad:', err));
          }
        });

        (window as Window & typeof globalThis & { __checkSWUpdate?: () => void }).__checkSWUpdate = () => {
          logger.info('Verificando actualización de Service Worker manualmente...');
          registration.update().catch(err => logger.error('Error en actualización manual:', err));
        }
      }
    },
    onRegisterError(error) {
      logger.error('Error en el registro del Service Worker:', error)
    },
  })
}

(window as Window & typeof globalThis & { 
  __updateSW?: typeof updateSW;
  __checkSWUpdate?: () => void;
}).__updateSW = updateSW;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
