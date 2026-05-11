const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Convierte una URL relativa o absoluta a una URL completa de la API.
 */
export function getImageUrl(url: string): string {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const cleanUrl = url.replace(/^\/api\//, '/')
    return `${API_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
}

/**
 * Constantes de optimización (Sincronizadas con el backend ImageOptimizer.java)
 */
export const IMAGE_CONFIG = {
    MAX_WIDTH: 1280,
    MAX_HEIGHT: 1280,
    PHOTO_QUALITY: 0.85,
    SIGNATURE_QUALITY: 0.95,
} as const;

/**
 * Comprime y optimiza una imagen en el cliente convirtiéndola a WebP.
 */
export async function compressImage(
    file: File, 
    quality: number = IMAGE_CONFIG.PHOTO_QUALITY, 
    maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d', { alpha: false });
                if (!ctx) return reject(new Error('No se pudo obtener el contexto del canvas'));

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Error al generar el Blob de la imagen'));
                        const compressedFile = new File([blob], `${file.name.split('.')[0]}_opt.webp`, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
