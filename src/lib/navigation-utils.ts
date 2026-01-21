/**
 * Utilidad para manejar navegación de mapas en todos los dispositivos y contextos.
 * Usa la misma configuración para PWA y Web - abre Google Maps en una nueva pestaña.
 */

/** Información geográfica o descriptiva para navegación. */
interface Location {
    /** Latitud decimal. */
    latitude?: number;
    /** Longitud decimal. */
    longitude?: number;
    /** Dirección física (fallback si no hay lat/lng). */
    address?: string;
}

/**
 * Abre Google Maps en una nueva pestaña con el destino especificado.
 * 
 * @param destination La ubicación de destino (lat/lng o dirección).
 * @param originLat Latitud de origen opcional.
 * @param originLng Longitud de origen opcional.
 */
export const openMaps = (
    destination: Location,
    originLat?: number,
    originLng?: number
) => {
    const { latitude, longitude, address } = destination;

    if (!latitude && !longitude && !address) {
        return;
    }

    let webUrl = '';
    if (latitude && longitude) {
        webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving&dir_action=navigate`;
        if (originLat && originLng) {
            webUrl += `&origin=${originLat},${originLng}`;
        }
    } else if (address) {
        webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    window.open(webUrl, '_blank', 'noopener,noreferrer');
};
