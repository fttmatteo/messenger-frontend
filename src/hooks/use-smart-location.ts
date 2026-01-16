import { useState, useCallback } from 'react'
import { trackingService } from '@/services/tracking.service'
import { createLogger } from '@/utils/logger'
import { toast } from 'sonner'

const logger = createLogger('useSmartLocation')

export interface LocationResult {
    latitude: number
    longitude: number
}

export function useSmartLocation() {
    const [loading, setLoading] = useState(false)

    const getCurrentLocation = useCallback(async (): Promise<LocationResult> => {
        setLoading(true)
        try {
            const lastKnown = trackingService.getLastKnownLocation()
            const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000)

            if (isRecent && lastKnown) {
                return { latitude: lastKnown.latitude, longitude: lastKnown.longitude }
            }

            return await new Promise<LocationResult>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("La geolocalización no es soportada por este navegador."))
                    return
                }

                const timeoutId = setTimeout(() => {
                    reject(new Error("Tiempo de espera agotado (Timeout)"))
                }, 10000)

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId)
                        resolve({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        })
                    },
                    (err) => {
                        clearTimeout(timeoutId)
                        let msg = err.message
                        if (err.code === 1) msg = "Permiso de ubicación denegado"
                        else if (err.code === 2) msg = "Ubicación no disponible"
                        else if (err.code === 3) msg = "Tiempo de espera agotado"
                        reject(new Error(msg))
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )
            })
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Error desconocido"
            logger.error("Error al obtener ubicación inteligente", error)
            toast.warning("Ubicación no capturada", {
                description: `${msg}. Se continuará sin ubicación precisa.`,
                duration: 4000
            })

            throw error;
        } finally {
            setLoading(false)
        }
    }, [])

    return { getCurrentLocation, loading }
}
