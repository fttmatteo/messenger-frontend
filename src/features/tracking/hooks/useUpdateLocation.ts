/**
 * Hook useUpdateLocation
 * 
 * Mutation para actualizar la ubicación del mensajero.
 * Usado por la app del mensajero para enviar su posición GPS.
 */

import { useMutation } from '@tanstack/react-query'
import { updateLocation } from '../api'
import type { LocationUpdate } from '../types'

/**
 * Hook para enviar actualizaciones de ubicación al backend
 * 
 * @example
 * const { mutate: sendLocation } = useUpdateLocation()
 * 
 * // Cuando se obtiene nueva posición GPS:
 * sendLocation({
 *   messengerId: 1,
 *   latitude: 6.217,
 *   longitude: -75.567,
 *   status: 'ONLINE'
 * })
 */
export function useUpdateLocation() {
    return useMutation<void, Error, LocationUpdate>({
        mutationFn: updateLocation,
        // No necesitamos invalidar queries porque esto es solo para enviar
        // Las queries de activeMessengers se actualizan con refetchInterval
    })
}
