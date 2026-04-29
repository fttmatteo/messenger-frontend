import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackingApiService } from '../tracking-api.service';
import apiClient from '../api-client';

vi.mock('../api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('TrackingApiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getHistory', () => {
        it('should call the paginated endpoint with correct parameters', async () => {
            const mockUuid = 'messenger-uuid';
            const mockDate = '2024-01-01';
            const mockResponse = {
                content: [{ latitude: 1, longitude: 2, timestamp: '2024-01-01T10:00:00Z' }],
                totalElements: 1
            };

            vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

            const result = await trackingApiService.getHistory(mockUuid, mockDate, 1, 50);

            expect(apiClient.get).toHaveBeenCalledWith(`/tracking/history/pageable/${mockUuid}`, {
                params: {
                    date: mockDate,
                    page: 1,
                    size: 50
                }
            });
            expect(result).toEqual(mockResponse);
        });

        it('should use default page and size if not provided', async () => {
            const mockUuid = 'messenger-uuid';
            const mockDate = '2024-01-01';
            vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } });

            await trackingApiService.getHistory(mockUuid, mockDate);

            expect(apiClient.get).toHaveBeenCalledWith(expect.any(String), {
                params: {
                    date: mockDate,
                    page: 0,
                    size: 100
                }
            });
        });
    });

    describe('getActiveMessengers', () => {
        it('should fetch active messengers with a timestamp', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
            await trackingApiService.getActiveMessengers();
            expect(apiClient.get).toHaveBeenCalledWith('/tracking/active', expect.objectContaining({
                params: expect.objectContaining({ t: expect.any(Number) })
            }));
        });
    });
});
