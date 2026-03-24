/**
 * Devuelve el timestamp más reciente entre dos fechas en formato ISO string.
 */
export function getLatestTimestamp(time1: string | undefined, time2: string | undefined): string | undefined {
    if (!time1) return time2;
    if (!time2) return time1;
    
    const t1 = new Date(time1).getTime();
    const t2 = new Date(time2).getTime();
    
    if (isNaN(t1)) return time2;
    if (isNaN(t2)) return time1;
    
    return t1 > t2 ? time1 : time2;
}

/**
 * Verifica si un mensajero está realmente en línea basado en su estado y hora de última actualización
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
