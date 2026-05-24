import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configService } from '@/features/system/services/config.service';
import { apiClient } from '@/shared/services/api-client';
import { logger } from '@/shared/utils/logger';

vi.mock('@/shared/services/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        put: vi.fn(),
    },
}));

vi.mock('@/utils/logger', () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe('configService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getStatusColors', () => {
        it('should return colors from object response', async () => {
            const mockColors = { PENDING: '#ff0000' };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockColors });
            const result = await configService.getStatusColors();
            expect(result).toEqual(mockColors);
        });

        it('should return colors from string response', async () => {
            const mockColors = { PENDING: '#ff0000' };
            vi.mocked(apiClient.get).mockResolvedValue({ data: JSON.stringify(mockColors) });
            const result = await configService.getStatusColors();
            expect(result).toEqual(mockColors);
        });

        it('should return empty object and log error if JSON is invalid', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: 'invalid-json' });
            const result = await configService.getStatusColors();
            expect(result).toEqual({});
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('updateStatusColors', () => {
        it('should call put with JSON string', async () => {
            const mockColors = { PENDING: '#ff0000' };
            vi.mocked(apiClient.put).mockResolvedValue({});
            await configService.updateStatusColors(mockColors);
            expect(apiClient.put).toHaveBeenCalledWith(
                '/settings/status-colors',
                JSON.stringify(mockColors),
                expect.anything()
            );
        });
    });
});
