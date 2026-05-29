import { useState, useEffect } from 'react'

/**
 * Hook para retrasar la actualización de un valor hasta que haya pasado
 * una cantidad específica de tiempo (ms) desde la última vez que cambió.
 * Ideal para optimizar peticiones de red en barras de búsqueda.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}
