import { apiClient } from './api-client'

export const configService = {
    getStatusColors: async (): Promise<Record<string, string>> => {
        const response = await apiClient.get<string | Record<string, string>>('/settings/status-colors')
        // The backend might return a JSON string if we sent it as a raw string, 
        // or a Record if Jackson parsed it. Since we return a String from controller, 
        // it might be a JSON string.
        const data = response.data
        if (typeof data === 'string') {
            try {
                return JSON.parse(data)
            } catch (e) {
                console.error('Error parsing status colors:', e)
                return {}
            }
        }
        return data as Record<string, string>
    },

    updateStatusColors: async (colors: Record<string, string>): Promise<void> => {
        await apiClient.put('/settings/status-colors', JSON.stringify(colors), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}
