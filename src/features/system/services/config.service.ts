import { apiClient } from '@/shared/services/api-client'
import { logger } from '@/shared/utils/logger'

/**
 * Servicio encargado de gestionar la configuración global de la aplicación.
 * Permite administrar ajustes dinámicos como los colores asociados a los estados de entrega.
 */
export const configService = {
    /**
     * Obtiene el mapeo actual de colores asignados a cada estado.
     * @returns Un objeto donde las llaves son estados y los valores son códigos de color hexadecimales.
     */
    getStatusColors: async (): Promise<Record<string, string>> => {
        const response = await apiClient.get<string | Record<string, string>>('/settings/status-colors')
        const data = response.data
        if (typeof data === 'string') {
            try {
                return JSON.parse(data)
            } catch (e) {
                logger.error('Error al parsear los colores de estado:', e)
                return {}
            }
        }
        return data as Record<string, string>
    },

    /**
     * Actualiza los colores globales asignados a los estados de los servicios.
     * @param colors - Diccionario con los nuevos colores para cada estado.
     */
    updateStatusColors: async (colors: Record<string, string>): Promise<void> => {
        await apiClient.put('/settings/status-colors', JSON.stringify(colors), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}
