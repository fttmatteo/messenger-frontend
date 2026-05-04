declare module 'node-webpmux' {
    export class WebP {
        constructor();
        addFrame(data: Uint8Array | ArrayBuffer, options: { delay: number }): Promise<void>;
        setAnimationSettings(settings: { loopCount: number }): void;
        save(): Promise<Uint8Array>;
        static fromUint8Array(data: Uint8Array): WebP;
    }
    export const Image: unknown;
}
