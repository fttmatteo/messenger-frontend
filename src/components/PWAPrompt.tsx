/**
 * Componente de Prompt para Actualización PWA
 * 
 * Muestra un banner cuando hay una nueva versión disponible
 * de la aplicación. Permite al usuario actualizar o ignorar.
 */

import { usePWA } from '@/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { RefreshCw, X, WifiOff } from 'lucide-react'

/**
 * PWAPrompt - Banner de actualización y estado offline
 * 
 * Muestra:
 * - Banner cuando hay nueva versión disponible
 * - Indicador cuando la app está lista para uso offline
 * - Indicador cuando el usuario está sin conexión
 */
export function PWAPrompt() {
    const { needRefresh, offlineReady, isOffline, updateServiceWorker, closePrompt } = usePWA()

    // No mostrar nada si no hay prompts activos y está online
    if (!needRefresh && !offlineReady && !isOffline) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
            {/* Banner de actualización disponible */}
            {needRefresh && (
                <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <div>
                            <p className="font-medium">Nueva versión disponible</p>
                            <p className="text-sm text-blue-100">Actualiza para obtener las mejoras</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateServiceWorker(true)}
                            className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                            Actualizar
                        </Button>
                        <button onClick={closePrompt} className="p-1 hover:bg-blue-500 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Banner de app lista para offline */}
            {offlineReady && !needRefresh && (
                <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-3">
                    <div>
                        <p className="font-medium">App lista para uso offline</p>
                        <p className="text-sm text-green-100">Puedes usar E-PLACA sin conexión</p>
                    </div>
                    <button onClick={closePrompt} className="p-1 hover:bg-green-500 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Indicador de modo offline */}
            {isOffline && (
                <div className="bg-amber-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-3 mt-2">
                    <WifiOff className="w-5 h-5" />
                    <p className="font-medium">Sin conexión a internet</p>
                </div>
            )}
        </div>
    )
}
