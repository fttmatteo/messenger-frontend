/**
 * Declaraciones de tipos para la biblioteca 'gif.js', la cual carece de tipos oficiales.
 * Define las interfaces para configuración de GIF, opciones de cuadros y la clase principal GIF.
 */
declare module 'gif.js' {
    /**
     * Opciones de configuración inicial para la instancia de GIF.
     */
    interface GIFOptions {
        workers?: number
        quality?: number
        width?: number
        height?: number
        workerScript?: string
        background?: string
        transparent?: string
        repeat?: number
        dither?: boolean | string
    }

    /**
     * Opciones específicas para cada cuadro (frame) añadido al GIF.
     */
    interface GIFFrameOptions {
        delay?: number
        copy?: boolean
        dispose?: number
    }

    /**
     * Clase principal para la generación de GIFs animados en el cliente.
     */
    class GIF {
        constructor(options?: GIFOptions)
        addFrame(
            element: ImageData | HTMLCanvasElement | CanvasRenderingContext2D,
            options?: GIFFrameOptions
        ): void
        on(event: 'finished', callback: (blob: Blob) => void): void
        on(event: 'progress', callback: (progress: number) => void): void
        on(event: 'error', callback: (error: Error) => void): void
        render(): void
        abort(): void
    }

    export default GIF
}
