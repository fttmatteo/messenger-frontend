/**
 * Check if a messenger is truly online based on their status and last update time
 * @param status - The messenger's status (ACTIVE or OFFLINE)
 * @param lastUpdate - ISO timestamp of last signal
 * @param thresholdMinutes - Minutes threshold to consider online (default: 2)
 * @returns true if messenger is online (active AND recent signal)
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
