import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

/**
 * Configuración global para el entorno de pruebas unitarias y de integración.
 * Configura MSW para interceptar peticiones de red y define mocks para APIs del navegador.
 */
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

/**
 * Simulador manual de Web Storage para entornos JSDOM donde no está disponible o es inconsistente.
 */
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] || null,
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Limpiar después de cada prueba
afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    localStorage.clear();
    sessionStorage.clear();
});

// Cerrar el servidor MSW después de todas las pruebas
afterAll(() => server.close());


/**
 * Mocks para APIs modernas de DOM no soportadas nativamente por JSDOM.
 * Incluye ResizeObserver e IntersectionObserver para componentes UI complejos.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock de IntersectionObserver (requerido por algunos componentes)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() { return []; }
};

// Mock de eventos de puntero para Radix UI Select
if (typeof window !== 'undefined' && window.Element && !window.Element.prototype.hasPointerCapture) {
    window.Element.prototype.hasPointerCapture = vi.fn();
    window.Element.prototype.releasePointerCapture = vi.fn();
    window.Element.prototype.setPointerCapture = vi.fn();
    window.Element.prototype.scrollIntoView = vi.fn();
}

// Mock de matchMedia (para hooks responsivos)
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

