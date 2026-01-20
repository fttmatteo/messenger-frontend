declare module 'gif.js' {
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

    interface GIFFrameOptions {
        delay?: number
        copy?: boolean
        dispose?: number
    }

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
