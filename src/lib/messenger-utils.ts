/**
 * Verifica si un mensajero está realmente en línea basado en su estado y hora de última actualización
 * @param status - El estado del mensajero (ACTIVE u OFFLINE)
 * @param lastUpdate - Marca de tiempo ISO de la última señal
 * @param thresholdMinutes - Umbral de minutos para considerar en línea (por defecto: 2)
 * @returns true si el mensajero está en línea (activo Y señal reciente)
 */
export function isMessengerOnline(
    status: 'ACTIVE' | 'OFFLINE' | string,
    lastUpdate: string | undefined,
    thresholdMinutes: number = 2,
    now: number = Date.now()
): boolean {
    if (status !== 'ACTIVE') return false
    if (!lastUpdate) return false

    const lastUpdateTime = new Date(lastUpdate).getTime()
    if (isNaN(lastUpdateTime)) return false

    const thresholdMs = thresholdMinutes * 60 * 1000

    return (now - lastUpdateTime) < thresholdMs
}
