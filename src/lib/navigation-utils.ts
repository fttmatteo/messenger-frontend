import { toast } from "sonner"

/**
 * Utility for handling map navigation across all devices and contexts.
 * Uses the same configuration for both PWA and Web - opens Google Maps in a new tab.
 */

interface Location {
    latitude?: number;
    longitude?: number;
    address?: string;
}

/**
 * Opens Google Maps in a new tab with the specified destination.
 * 
 * @param destination The destination location (lat/lng or address).
 * @param isIOS Boolean indicating if the current device is iOS (kept for backwards compatibility, not used).
 * @param originLat Optional origin latitude.
 * @param originLng Optional origin longitude.
 */
export const openMaps = (
    destination: Location,
    isIOS: boolean,
    originLat?: number,
    originLng?: number
) => {
    const { latitude, longitude, address } = destination;

    if (!latitude && !longitude && !address) {
        console.warn("No location provided for navigation");
        return;
    }

    // Build web URL - same configuration for both PWA and Web
    let webUrl = '';
    if (latitude && longitude) {
        webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        if (originLat && originLng) {
            webUrl += `&origin=${originLat},${originLng}`;
        }
    } else if (address) {
        webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    // Both PWA and Web use the same configuration - Open in new tab
    window.open(webUrl, '_blank', 'noopener,noreferrer');
};
