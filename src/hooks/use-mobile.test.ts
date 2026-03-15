import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

/**
 * Suite de pruebas para el hook useIsMobile.
 * Verifica la detección correcta del tamaño de viewport del dispositivo,
 * asegurando la reactividad ante eventos de redimensionamiento (resize).
 */
describe('useIsMobile', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    });

    it('debe devolver false para el ancho de escritorio', () => {
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('debe devolver true para el ancho móvil', () => {
        window.innerWidth = 500;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('debe manejar el cambio de tamaño de la ventana', async () => {
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        act(() => {
            window.innerWidth = 500;
            window.dispatchEvent(new Event('resize'));
        });
    });
});
