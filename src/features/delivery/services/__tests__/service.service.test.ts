import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serviceDeliveryService } from '@/features/delivery/services/service.service';
import apiClient from '@/shared/services/api-client';
import type { ServiceStatus } from '@/features/delivery/types/service.types';

vi.mock('@/shared/services/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('@/shared/utils/logger', () => ({
    createLogger: () => ({
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    }),
}));

describe('ServiceDeliveryService', () => {
    const mockUuid = '550e8400-e29b-41d4-a716-446655440000';
    const mockService = {
        idServiceDelivery: 1,
        uuid: mockUuid,
        plate: {
            idPlate: 1,
            plateNumber: 'CHASIS00001',
            plateType: 'MOTORCYCLE'
        },
        dealership: {
            idDealership: 1,
            uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
            name: 'Test Dealership',
            address: '123 St',
            phone: '555-1234',
            zone: 'NORTH'
        },
        originDealership: {
            idDealership: 2,
            uuid: 'a29cfc1b-08fb-44b4-af04-cc9172be53f9',
            name: 'Origin Dealership',
            address: '456 Origin St',
            phone: '555-5678',
            zone: 'SOUTH'
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
        it('should throw error as it is removed', async () => {
            await expect(serviceDeliveryService.getAll()).rejects.toThrow('getAll() IS REMOVED');
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
            const result = await serviceDeliveryService.getById(mockUuid);
            expect(result).toEqual(mockService);
            expect(apiClient.get).toHaveBeenCalledWith(`/services/findByServiceId/${mockUuid}`);
        });
    });

    describe('create', () => {
        it('should send FormData correctly', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockService });
            await serviceDeliveryService.create({
                dealershipId: '1',
                originDealershipId: '2',
                manualPlateNumber: 'XYZ789',
                latitude: 10,
                longitude: 20
            });

            const call = vi.mocked(apiClient.post).mock.calls[0];
            expect(call[0]).toBe('/services/createService');
            expect(call[1]).toBeInstanceOf(FormData);
            const formData = call[1] as FormData;
            expect(formData.get('dealershipId')).toBe('1');
            expect(formData.get('originDealershipId')).toBe('2');
            expect(formData.get('manualPlateNumber')).toBe('XYZ789');
        });
    });



    describe('updateStatus', () => {
        it('should send evidence as FormData', async () => {
            vi.mocked(apiClient.put).mockResolvedValue({ data: mockService });

            await serviceDeliveryService.updateStatus(mockUuid, {
                status: 'DELIVERED',
                observation: 'All good',
                photos: [new File([''], 'p1.jpg')]
            });

            expect(apiClient.put).toHaveBeenCalledWith(`/services/updateService/${mockUuid}`, expect.any(FormData));
        });
    });

    describe('trash operations', () => {
        it('getTrash should return paginated response', async () => {
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
            const result = await serviceDeliveryService.getTrash();
            expect(result).toEqual(mockPaginated);
        });

        it('restore should call API', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockService });
            await serviceDeliveryService.restore(mockUuid);
            expect(apiClient.post).toHaveBeenCalledWith(`/services/trash/restore/${mockUuid}`);
        });

        it('delete should call API', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({});
            await serviceDeliveryService.delete(mockUuid);
            expect(apiClient.delete).toHaveBeenCalledWith(`/services/deleteService/${mockUuid}`);
        });

        it('permanentDelete should call API', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'Deleted' } });
            await serviceDeliveryService.permanentDelete(mockUuid);
            expect(apiClient.delete).toHaveBeenCalledWith(`/services/trash/${mockUuid}`);
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
            await serviceDeliveryService.reassign(mockUuid, 100);
            expect(apiClient.put).toHaveBeenCalledWith(`/services/reassign/${mockUuid}`, { messengerId: 100 });
        });
    });
});
