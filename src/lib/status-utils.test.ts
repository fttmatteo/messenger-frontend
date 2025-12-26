import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
    getStatusBadge,
    getStatusIconConfig,
    getPlateTypeLabel,
    getAvailableStatusesForUser,
    isWithin72hWindow,
    getServiceLockReason,
    canUserEditService
} from './status-utils';

describe('status-utils', () => {
    describe('getStatusBadge', () => {
        it('should return correct badge config for known statuses', () => {
            expect(getStatusBadge('PENDING').label).toBe('Pendiente');
            expect(getStatusBadge('PENDING').className).toContain('bg-indigo-500');
            expect(getStatusBadge('CANCELED').label).toBe('Cancelado');
            expect(getStatusBadge('CANCELED').className).toContain('bg-red-500');
        });

        it('should return default for unknown status', () => {
            // Testing invalid status input
            const result = getStatusBadge('UNKNOWN');
            expect(result.label).toBe('UNKNOWN');
            expect(result.className).toContain('bg-gray-500');
        });
    });

    describe('getStatusIconConfig', () => {
        it('should return correct icon config', () => {
            const result = getStatusIconConfig('DELIVERED');
            expect(result.label).toBe('Entregado');
            expect(result.dotColor).toContain('bg-green-500');
            expect(result.textColor).toContain('text-green-500');
        });
    });

    describe('getPlateTypeLabel', () => {
        it('should return correct label', () => {
            expect(getPlateTypeLabel('CAR')).toBe('Carro');
            expect(getPlateTypeLabel('MOTORCYCLE')).toBe('Moto');
        });
    });

    describe('Business Rules (Status Transitions)', () => {
        const NOW = new Date('2024-01-01T12:00:00Z');

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(NOW);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        describe('MESSENGER Rules', () => {
            it('should allow transitions from ASSIGNED', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER', 'ASSIGNED');
                expect(statuses.map(s => s.value)).toEqual(['PENDING', 'DELIVERED', 'RETURNED']);
            });

            it('should allow transitions from RETURNED', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER', 'RETURNED');
                expect(statuses.map(s => s.value)).toEqual(['PENDING', 'DELIVERED', 'RETURNED']);
            });

            it('should return locked for PENDING', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER', 'PENDING');
                expect(statuses).toEqual([]);
                expect(getServiceLockReason('MESSENGER', 'PENDING')).toContain('revisión');
            });

            it('should return locked for DELIVERED', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER', 'DELIVERED');
                expect(statuses).toEqual([]);
                expect(getServiceLockReason('MESSENGER', 'DELIVERED')).toContain('entregado');
            });
        });

        describe('ADMIN Rules', () => {
            it('should allow transitions from PENDING', () => {
                const statuses = getAvailableStatusesForUser('ADMIN', 'PENDING');
                expect(statuses.map(s => s.value)).toEqual(['CANCELED', 'RESOLVED']);
            });

            it('should allow transitions from ASSIGNED', () => {
                const statuses = getAvailableStatusesForUser('ADMIN', 'ASSIGNED');
                expect(statuses.map(s => s.value)).toEqual(['CANCELED', 'RESOLVED']);
            });

            it('should allow transitions from DELIVERED within 72h', () => {
                // Delivered 1 hour ago
                const deliveredAt = new Date(NOW.getTime() - 1000 * 60 * 60).toISOString();
                const statuses = getAvailableStatusesForUser('ADMIN', 'DELIVERED', deliveredAt);
                expect(statuses.map(s => s.value)).toEqual(['CANCELED', 'RESOLVED']);
                expect(isWithin72hWindow('DELIVERED', deliveredAt)).toBe(true);
            });

            it('should NOT allow transitions from DELIVERED after 72h', () => {
                // Delivered 73 hours ago
                const deliveredAt = new Date(NOW.getTime() - 1000 * 60 * 60 * 73).toISOString();
                const statuses = getAvailableStatusesForUser('ADMIN', 'DELIVERED', deliveredAt);
                expect(statuses).toEqual([]);
                expect(isWithin72hWindow('DELIVERED', deliveredAt)).toBe(false);
                expect(getServiceLockReason('ADMIN', 'DELIVERED', deliveredAt)).toContain('expirado');
            });
        });

        describe('canUserEditService', () => {
            it('should return true if available statuses exist', () => {
                expect(canUserEditService('MESSENGER', 'ASSIGNED')).toBe(true);
            });

            it('should return false if no available statuses', () => {
                expect(canUserEditService('MESSENGER', 'PENDING')).toBe(false);
            });
        });
    });
});
