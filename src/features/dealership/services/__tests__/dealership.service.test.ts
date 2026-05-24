import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dealershipService } from '../dealership.service';
import apiClient from '@/shared/services/api-client';

vi.mock('@/services/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('dealershipService', () => {
    const mockDealership = { idDealership: 1, uuid: 'dealer-uuid-1', name: 'Dealership 1', address: 'Address 1' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAll should return array', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({ data: [mockDealership] });
        const result = await dealershipService.getAll();
        expect(result).toEqual([mockDealership]);
        expect(apiClient.get).toHaveBeenCalledWith('/dealerships/allDealerships');
    });

    it('getById should return one', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockDealership });
        const result = await dealershipService.getById('1');
        expect(result).toEqual(mockDealership);
        expect(apiClient.get).toHaveBeenCalledWith('/dealerships/findByDealershipId/1');
    });

    it('create should call API', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockDealership });
        const result = await dealershipService.create({ name: 'New', address: 'Add', phone: '123', zone: 'Z1' });
        expect(result).toEqual(mockDealership);
        expect(apiClient.post).toHaveBeenCalledWith('/dealerships/createDealership', expect.anything());
    });

    it('update should call API', async () => {
        vi.mocked(apiClient.put).mockResolvedValue({ data: mockDealership });
        const result = await dealershipService.update('1', { name: 'Updated', address: 'Add', phone: '123', zone: 'Z1' });
        expect(result).toEqual(mockDealership);
        expect(apiClient.put).toHaveBeenCalledWith('/dealerships/updateDealership/1', expect.anything());
    });

    it('delete should call API', async () => {
        vi.mocked(apiClient.delete).mockResolvedValue({});
        await dealershipService.delete('1');
        expect(apiClient.delete).toHaveBeenCalledWith('/dealerships/deleteDealership/1');
    });

    it('geocode should call API', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockDealership });
        const result = await dealershipService.geocode('1');
        expect(result).toEqual(mockDealership);
        expect(apiClient.post).toHaveBeenCalledWith('/dealerships/geocodeDealership/1');
    });
});
