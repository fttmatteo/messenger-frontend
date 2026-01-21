/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

// Precachear todos los activos generados por el build
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Estrategia para la API: Network First (Red primero, luego caché)
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutos
            }),
        ],
        networkTimeoutSeconds: 10,
    })
)

// Background Sync
interface SyncEvent extends Event {
    tag: string;
    waitUntil(promise: Promise<void>): void;
}

self.addEventListener('sync', (event) => {
    const syncEvent = event as SyncEvent;
    if (syncEvent.tag === 'sync-pending-actions') {
        syncEvent.waitUntil(syncPendingActions())
    }
})

async function syncPendingActions() {
    console.log('[SW] Iniciando sincronización en segundo plano...')
    // Nota: Dado que el SW no tiene acceso directo a los servicios de la app
    // por cuestiones de bundling/modulos en Vite, usualmente se envía un mensaje
    // a los clientes activos o se utiliza una implementación compartida de IDB.
    const allClients = await self.clients.matchAll()
    for (const client of allClients) {
        client.postMessage({ type: 'SYNC_PENDING_ACTIONS' })
    }
}

// Escuchar skipWaiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})
