import { type Libraries } from '@react-google-maps/api';

/**
 * Librerías de Google Maps necesarias para las funcionalidades del sistema (Geocoding, Markers, Places).
 * Se extraen a un archivo de constantes para cumplir con las reglas de Fast Refresh de React.
 */
export const MAP_LIBRARIES: Libraries = ["marker", "places"];
