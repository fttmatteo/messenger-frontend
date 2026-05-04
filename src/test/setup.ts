import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

// Mock de Capacitor core (plugins nativos no disponibles en entorno de test)
vi.mock('@capacitor/core', async () => {
    const actual = await vi.importActual('@capacitor/core');
    return {
        ...actual,
        registerPlugin: (name: string) => {
            if (name === 'LocationService') {
                return {
                    startService: vi.fn().mockResolvedValue({ started: true }),
                    stopService: vi.fn().mockResolvedValue({ stopped: true }),
                };
            }
            // Fallback para otros plugins
            return new Proxy({}, {
                get: () => vi.fn().mockResolvedValue({}),
            });
        },
    };
});

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

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
}

// Mock de indexedDB (mínimo para que librerías como idb-keyval no exploten)
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'indexedDB', {
        value: {
            open: vi.fn().mockReturnValue({ onupgradeneeded: null, onsuccess: null, onerror: null }),
        },
        writable: true
    });
}

// Limpiar después de cada prueba
afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
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

if (typeof window !== 'undefined') {
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
}

// Mock de Service Worker y Sync API
if (typeof window !== 'undefined') {
    Object.defineProperty(navigator, 'serviceWorker', {
        value: {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            register: vi.fn().mockResolvedValue({}),
            ready: Promise.resolve({
                sync: {
                    register: vi.fn().mockResolvedValue(undefined),
                    getTags: vi.fn().mockResolvedValue([]),
                }
            }),
        },
        writable: true,
        configurable: true
    });

    // Mock de SyncManager en window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SyncManager = class { };

    // Mock de navigator.onLine (por defecto true)
    Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
    });
}

