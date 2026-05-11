import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

/**
 * Simulador manual de Web Storage para entornos JSDOM donde no está disponible o es inconsistente.
 */
const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] || null,
    };
};

const mockLocalStorage = createStorageMock();
const mockSessionStorage = createStorageMock();

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
}

// Mock de @capacitor/preferences para persistencia segura en tests
// Usamos referencias explícitas a los mocks definidos arriba
vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(async ({ key }) => ({ value: window.localStorage.getItem(key) })),
        set: vi.fn(async ({ key, value }) => { window.localStorage.setItem(key, value); }),
        remove: vi.fn(async ({ key }) => { window.localStorage.removeItem(key); }),
        clear: vi.fn(async () => { window.localStorage.clear(); }),
    }
}));

// Mock de Capacitor core
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
            return new Proxy({}, {
                get: () => vi.fn().mockResolvedValue({}),
            });
        },
    };
});

/**
 * Configuración global para el entorno de pruebas unitarias y de integración.
 */
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
    }
});

afterAll(() => server.close());

// Mocks para APIs modernas de DOM
if (typeof window !== 'undefined') {
    (globalThis as any).ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    (globalThis as any).IntersectionObserver = class {
        constructor() { }
        observe() { }
        unobserve() { }
        disconnect() { }
        takeRecords() { return []; }
    };

    if (window.Element && !window.Element.prototype.hasPointerCapture) {
        window.Element.prototype.hasPointerCapture = vi.fn();
        window.Element.prototype.releasePointerCapture = vi.fn();
        window.Element.prototype.setPointerCapture = vi.fn();
        window.Element.prototype.scrollIntoView = vi.fn();
    }

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

    (window as any).SyncManager = class { };

    Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
    });
}
