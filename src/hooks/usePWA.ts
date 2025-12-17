/**
 * Hook para Registro de Service Worker (PWA)
 * 
 * Este hook maneja la lógica de PWA:
 * - Registro del Service Worker
 * - Detección de actualizaciones disponibles
 * - Prompt para recargar cuando hay nueva versión
 * - Estado de conexión offline
 */

import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Estado del Service Worker
 */
interface PWAState {
    /** Indica si la app necesita actualización */
    needRefresh: boolean
    /** Indica si el SW está instalado y listo para offline */
    offlineReady: boolean
    /** Indica si el usuario está offline */
    isOffline: boolean
}

/**
 * Acciones disponibles del PWA
 */
interface PWAActions {
    /** Actualizar el Service Worker a la nueva versión */
    updateServiceWorker: () => void
    /** Cerrar el prompt de actualización */
    closePrompt: () => void
}

/**
 * Hook usePWA
 * 
 * Proporciona estado y acciones para el manejo de PWA.
 * 
 * @returns Objeto con estado y acciones de PWA
 * 
 * @example
 * const { needRefresh, updateServiceWorker, isOffline } = usePWA()
 * 
 * if (needRefresh) {
 *   // Mostrar banner de actualización
 * }
 */
export function usePWA(): PWAState & PWAActions {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        offlineReady: [offlineReady, setOfflineReady],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(registration) {
            console.log('SW Registrado:', registration)
        },
        onRegisterError(error) {
            console.error('Error al registrar SW:', error)
        },
    })

    // Escuchar cambios en el estado de conexión
    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const closePrompt = () => {
        setNeedRefresh(false)
        setOfflineReady(false)
    }

    return {
        needRefresh,
        offlineReady,
        isOffline,
        updateServiceWorker,
        closePrompt,
    }
}
