import { describe, it, expect } from 'vitest';
import {
    getStatusBadge,
    getStatusIconConfig,
    getPlateTypeLabel,
    getAvailableStatusesForUser,
    getServiceLockReason,
    canUserEditService
} from './status-utils';

describe('status-utils', () => {
    describe('getStatusBadge', () => {
        it('should return correct badge config for known statuses', () => {
            // PENDING - indigo-500
            expect(getStatusBadge('PENDING').label).toBe('Pendiente');
            expect(getStatusBadge('PENDING').style?.backgroundColor).toBe('#6366f1');

            // CANCELED - red-500
            expect(getStatusBadge('CANCELED').label).toBe('Cancelado');
            expect(getStatusBadge('CANCELED').style?.backgroundColor).toBe('#ef4444');

            // DELETED - slate-500
            expect(getStatusBadge('DELETED').label).toBe('Eliminado');
            expect(getStatusBadge('DELETED').style?.backgroundColor).toBe('#64748b');
        });

        it('should return default for unknown status', () => {
            // Testing invalid status input - falls back to gray-500
            const result = getStatusBadge('UNKNOWN');
            expect(result.label).toBe('UNKNOWN');
            expect(result.style?.backgroundColor).toBe('#6b7280');
        });
    });

    describe('getStatusIconConfig', () => {
        it('should return correct icon config', () => {
            // DELIVERED - green-500
            const result = getStatusIconConfig('DELIVERED');
            expect(result.label).toBe('Entregado');
            expect(result.dotStyle.backgroundColor).toBe('#22c55e');
            expect(result.textStyle.color).toBe('#22c55e');

            // DELETED - slate-500
            const deletedResult = getStatusIconConfig('DELETED');
            expect(deletedResult.label).toBe('Eliminado');
            expect(deletedResult.dotStyle.backgroundColor).toBe('#64748b');
            expect(deletedResult.textStyle.color).toBe('#64748b');
        });
    });

    describe('getPlateTypeLabel', () => {
        it('should return correct label', () => {
            expect(getPlateTypeLabel('CAR')).toBe('Carro');
            expect(getPlateTypeLabel('MOTORCYCLE')).toBe('Moto');
        });
    });

    describe('Business Rules (Status Transitions)', () => {
        describe('MESSENGER Rules', () => {
            it('should return all messenger statuses', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER');
                expect(statuses.map(s => s.value)).toEqual(['PENDING', 'DELIVERED', 'RETURNED']);
            });

            it('should not include admin-only statuses', () => {
                const statuses = getAvailableStatusesForUser('MESSENGER');
                const values = statuses.map(s => s.value);
                expect(values).not.toContain('CANCELED');
                expect(values).not.toContain('RESOLVED');
            });
        });

        describe('ADMIN Rules', () => {
            it('should return all admin statuses', () => {
                const statuses = getAvailableStatusesForUser('ADMIN');
                expect(statuses.map(s => s.value)).toEqual(['CANCELED', 'RESOLVED']);
            });

            it('should not include messenger-only statuses', () => {
                const statuses = getAvailableStatusesForUser('ADMIN');
                const values = statuses.map(s => s.value);
                expect(values).not.toContain('PENDING');
                expect(values).not.toContain('DELIVERED');
                expect(values).not.toContain('RETURNED');
            });

            it('should use Revisado label for RESOLVED', () => {
                const statuses = getAvailableStatusesForUser('ADMIN');
                const resolved = statuses.find(s => s.value === 'RESOLVED');
                expect(resolved?.label).toBe('Revisado');
            });
        });

        describe('getServiceLockReason', () => {
            it('should always return null (no locks in simplified rules)', () => {
                expect(getServiceLockReason()).toBeNull();
            });
        });

        describe('canUserEditService', () => {
            it('should return true for MESSENGER', () => {
                expect(canUserEditService('MESSENGER')).toBe(true);
            });

            it('should return true for ADMIN', () => {
                expect(canUserEditService('ADMIN')).toBe(true);
            });
        });
    });
});
