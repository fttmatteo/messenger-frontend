import { describe, it, expect } from 'vitest';
import { cn } from './utils';

/**
 * Suite de pruebas para las utilidades generales del proyecto.
 * Se centra principalmente en la validación de la función "cn" para la
 * concatenación y combinación inteligente de clases de CSS (Tailwind Merge).
 */
describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
        });

        it('should handle conditional classes', () => {
            const isTrue = true;
            const isFalse = false;
            expect(cn('c-1', isTrue && 'c-2', isFalse && 'c-3')).toBe('c-1 c-2');
        });

        it('should handle objects', () => {
            expect(cn({ 'c-1': true, 'c-2': false })).toBe('c-1');
        });

        it('should merge tailwind classes correctly', () => {
            expect(cn('p-4 p-2')).toBe('p-2');
            expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
        });
    });
});
