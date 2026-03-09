import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serviceDeliveryService } from '../service.service';
import apiClient from '../api-client';
import { ServiceStatus } from '@/types/service.types';
import { z } from 'zod';

vi.mock('../api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/utils/logger', () => ({
    createLogger: () => ({
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    }),
}));

describe('ServiceDeliveryService', () => {
    const mockService = {
        idServiceDelivery: 1,
        plate: {
            idPlate: 1,
            plateNumber: 'ABC123',
            plateType: 'CAR'
        },
        dealership: {
            idDealership: 1,
            name: 'Test Dealership',
            address: '123 St',
            phone: '555-1234',
            zone: 'NORTH'
        },
        currentStatus: 'PENDING' as ServiceStatus,
        photos: [],
        history: [],
        createdAt: '2023-01-01T00:00:00Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return array of services', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: [mockService] });
            const result = await serviceDeliveryService.getAll();
            expect(result).toEqual([mockService]);
            expect(apiClient.get).toHaveBeenCalledWith('/services/allServices');
        });
    });

    describe('getAllPaginated', () => {
        it('should call with correct default params', async () => {
            const mockPaginated = {
                content: [mockService],
                totalElements: 1,
                totalPages: 1,
                pageSize: 10,
                currentPage: 0,
                first: true,
                last: true
            };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockPaginated });

            const result = await serviceDeliveryService.getAllPaginated();

            expect(result).toEqual(mockPaginated);
            expect(apiClient.get).toHaveBeenCalledWith('/services/allServicesPageable', {
                params: {
                    page: 0,
                    size: 10,
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                    status: undefined,
                    search: undefined
                }
            });
        });

        it('should join status array into comma-separated string', async () => {
            const mockPaginated = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                pageSize: 10,
                currentPage: 0,
                first: true,
                last: true
            };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockPaginated });
            await serviceDeliveryService.getAllPaginated({ status: ['PENDING', 'DELIVERED'] });
            expect(apiClient.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                params: expect.objectContaining({ status: 'PENDING,DELIVERED' })
            }));
        });
    });

    describe('getById', () => {
        it('should return single service', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockService });
            const result = await serviceDeliveryService.getById(1);
            expect(result).toEqual(mockService);
            expect(apiClient.get).toHaveBeenCalledWith('/services/findByServiceId/1');
        });
    });

    describe('create', () => {
        it('should send FormData correctly', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockService });
            const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

            await serviceDeliveryService.create({
                image: mockFile,
                dealershipId: '1',
                manualPlateNumber: 'XYZ789',
                latitude: 10,
                longitude: 20
            });

            const call = vi.mocked(apiClient.post).mock.calls[0];
            expect(call[0]).toBe('/services/createService');
            expect(call[1]).toBeInstanceOf(FormData);
            const formData = call[1] as FormData;
            expect(formData.get('dealershipId')).toBe('1');
            expect(formData.get('manualPlateNumber')).toBe('XYZ789');
        });
    });

    describe('extractPlate', () => {
        it('should return plate from API', async () => {
            const mockData = { plate: 'XYZ123', success: true, message: 'OK' };
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockData });
            const result = await serviceDeliveryService.extractPlate(new File([], 'test.jpg'));
            expect(result).toEqual(mockData);
        });
    });

    describe('updateStatus', () => {
        it('should send evidence as FormData', async () => {
            vi.mocked(apiClient.put).mockResolvedValue({ data: mockService });

            await serviceDeliveryService.updateStatus(1, {
                status: 'DELIVERED',
                observation: 'All good',
                photos: [new File([''], 'p1.jpg')]
            });

            expect(apiClient.put).toHaveBeenCalledWith('/services/updateService/1', expect.any(FormData));
        });
    });

    describe('trash operations', () => {
        it('getTrash should return array', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: [mockService] });
            const result = await serviceDeliveryService.getTrash();
            expect(result).toEqual([mockService]);
        });

        it('restore should call API', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockService });
            await serviceDeliveryService.restore(1);
            expect(apiClient.post).toHaveBeenCalledWith('/services/trash/restore/1');
        });

        it('delete should call API', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({});
            await serviceDeliveryService.delete(1);
            expect(apiClient.delete).toHaveBeenCalledWith('/services/deleteService/1');
        });

        it('permanentDelete should call API', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });
            await serviceDeliveryService.permanentDelete(1);
            expect(apiClient.delete).toHaveBeenCalledWith('/services/trash/1');
        });

        it('emptyTrash should call delete', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({ data: { deletedCount: 5 } });
            await serviceDeliveryService.emptyTrash();
            expect(apiClient.delete).toHaveBeenCalledWith('/services/trash/empty');
        });
    });

    describe('reassign', () => {
        it('should call put with messengerId', async () => {
            vi.mocked(apiClient.put).mockResolvedValue({ data: mockService });
            await serviceDeliveryService.reassign(1, 100);
            expect(apiClient.put).toHaveBeenCalledWith('/services/reassign/1', { messengerId: 100 });
        });
    });

    describe('getDailyStats', () => {
        it('should format dates correctly', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
            await serviceDeliveryService.getDailyStats(1, new Date('2023-01-01'), new Date('2023-01-02'));
            expect(apiClient.get).toHaveBeenCalledWith('/services/stats/daily', expect.objectContaining({
                params: {
                    messengerId: 1,
                    from: '2023-01-01',
                    to: '2023-01-02'
                }
            }));
        });
    });
});
