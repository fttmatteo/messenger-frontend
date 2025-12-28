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
            expect(getStatusBadge('PENDING').label).toBe('Pendiente');
            expect(getStatusBadge('PENDING').className).toContain('bg-indigo-500');
            expect(getStatusBadge('CANCELED').label).toBe('Cancelado');
            expect(getStatusBadge('CANCELED').className).toContain('bg-red-500');
            expect(getStatusBadge('DELETED').label).toBe('Eliminado');
            expect(getStatusBadge('DELETED').className).toContain('bg-slate-500');
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

            const deletedResult = getStatusIconConfig('DELETED');
            expect(deletedResult.label).toBe('Eliminado');
            expect(deletedResult.dotColor).toContain('bg-slate-500');
            expect(deletedResult.textColor).toContain('text-slate-500');
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
