/**
 * Utilidad para manejar navegación de mapas en todos los dispositivos y contextos.
 * Usa la misma configuración para PWA y Web - abre Google Maps en una nueva pestaña.
 */

interface Location {
    latitude?: number;
    longitude?: number;
    address?: string;
}

/**
 * Abre Google Maps en una nueva pestaña con el destino especificado.
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

    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isPWA || isMobile) {
        window.location.href = webUrl;
    } else {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
};
