import { createContext, useContext, type ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { MAP_LIBRARIES } from '@/shared/lib/maps.constants';

interface MapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const MapsContext = createContext<MapsContextType>({ isLoaded: false, loadError: undefined });

export function MapsProvider({ children }: { children: ReactNode }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES,
        version: 'weekly'
    });

    return (
        <MapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </MapsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMaps() {
    return useContext(MapsContext);
}
