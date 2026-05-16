import { describe, it, expect } from 'vitest';
import {
    getStatusBadge,
    getStatusIconConfig,
    getPlateTypeLabel,
    getAvailableStatusesForUser,
    getServiceLockReason,
    canUserEditService
} from './status-utils';
import { DEFAULT_STATUS_COLORS } from './status-colors';

const DEFAULT_FALLBACK_COLOR = '#6b7280';

/**
 * Suite de pruebas para las utilidades de lógica de negocio y estados.
 * Valida la correcta asignación de etiquetas, colores de insignias, iconos,
 * y las reglas de transición de estados permitidas según el rol del usuario.
 */
describe('status-utils', () => {
    describe('getStatusBadge', () => {
        it('should return correct badge config for known statuses', () => {
            expect(getStatusBadge('PENDING').label).toBe('Pendiente');
            expect(getStatusBadge('PENDING').style?.backgroundColor).toBe(DEFAULT_STATUS_COLORS.PENDING);

            expect(getStatusBadge('CANCELED').label).toBe('Cancelado');
            expect(getStatusBadge('CANCELED').style?.backgroundColor).toBe(DEFAULT_STATUS_COLORS.CANCELED);

            expect(getStatusBadge('DELETED').label).toBe('Eliminado');
            expect(getStatusBadge('DELETED').style?.backgroundColor).toBe(DEFAULT_STATUS_COLORS.DELETED);
        });

        it('should return default for unknown status', () => {
            const result = getStatusBadge('UNKNOWN');
            expect(result.label).toBe('UNKNOWN');
            expect(result.style?.backgroundColor).toBe(DEFAULT_FALLBACK_COLOR);
        });
    });

    describe('getStatusIconConfig', () => {
        it('should return correct icon config', () => {
            const result = getStatusIconConfig('DELIVERED');
            expect(result.label).toBe('Entregado');
            expect(result.dotStyle.backgroundColor).toBe(DEFAULT_STATUS_COLORS.DELIVERED);
            expect(result.textStyle.color).toBe(DEFAULT_STATUS_COLORS.DELIVERED);
            const deletedResult = getStatusIconConfig('DELETED');
            expect(deletedResult.label).toBe('Eliminado');
            expect(deletedResult.dotStyle.backgroundColor).toBe(DEFAULT_STATUS_COLORS.DELETED);
            expect(deletedResult.textStyle.color).toBe(DEFAULT_STATUS_COLORS.DELETED);
        });
    });

    describe('getPlateTypeLabel', () => {
        it('should return correct label', () => {
            expect(getPlateTypeLabel()).toBe('Moto');
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
