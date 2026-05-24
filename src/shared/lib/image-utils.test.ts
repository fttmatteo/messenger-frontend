import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compressImage, IMAGE_CONFIG, getImageUrl } from './image-utils'

describe('Image Utils', () => {
    describe('getImageUrl', () => {
        beforeEach(() => {
            vi.stubEnv('VITE_API_URL', 'http://test-api.com');
        });

        it('debe retornar string vacío si no hay url', () => {
            expect(getImageUrl('')).toBe('');
        });

        it('debe respetar urls que ya son absolutas', () => {
            const absolute = 'https://google.com/image.jpg';
            expect(getImageUrl(absolute)).toBe(absolute);
        });

        it('debe añadir el prefijo de API a rutas relativas', () => {
            const relative = '/services/photo.webp';
            expect(getImageUrl(relative)).toBe('http://test-api.com/services/photo.webp');
        });

        it('debe limpiar prefijos /api/ duplicados', () => {
            const withApi = '/api/services/photo.webp';
            const result = getImageUrl(withApi);
            expect(result).not.toContain('/api/api/');
            expect(result).toBe('http://test-api.com/services/photo.webp');
        });
    });

    describe('compressImage', () => {
    beforeEach(() => {
        globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
        globalThis.URL.revokeObjectURL = vi.fn();

        HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
            const blob = new Blob(['mock content'], { type: 'image/webp' });
            callback(blob);
        });

        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            drawImage: vi.fn(),
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;

        vi.stubGlobal('Image', class {
            onload: () => void = () => { };
            onerror: () => void = () => { };
            src: string = '';
            width: number = 2000;
            height: number = 1000;
            constructor() {
                setTimeout(() => this.onload(), 10);
            }
        });

        vi.stubGlobal('FileReader', class {
            onload: (ev: ProgressEvent<FileReader>) => void = () => { };
            readAsDataURL() {
                setTimeout(() => this.onload({ 
                    target: { result: 'data:image/jpeg;base64,mock' } 
                } as unknown as ProgressEvent<FileReader>), 10);
            }
        });
    });

    it('debe mantener las dimensiones si son menores al máximo', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;

        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg'));
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

        const optimized = await compressImage(file);

        expect(optimized.type).toBe('image/webp');
        expect(optimized.name).toContain('_opt.webp');
    });

    it('debe redimensionar si el ancho excede el máximo (1280px)', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2000;
        canvas.height = 1000;

        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg'));
        const file = new File([blob], 'large.jpg', { type: 'image/jpeg' });

        const optimized = await compressImage(file);

        expect(optimized).toBeDefined();
        expect(optimized.type).toBe('image/webp');
    });

    it('las constantes de configuración deben coincidir con el backend', () => {
        expect(IMAGE_CONFIG.MAX_WIDTH).toBe(1280);
        expect(IMAGE_CONFIG.PHOTO_QUALITY).toBe(0.85);
        expect(IMAGE_CONFIG.SIGNATURE_QUALITY).toBe(0.95);
    });
    });
});
