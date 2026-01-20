/**
 * Utility functions for file conversion.
 * Used for offline storage (IndexedDB requires base64) and restoration.
 */

/**
 * Convert a File or Blob to base64 string for storage in IndexedDB
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
            } else {
                reject(new Error('Failed to convert file to base64'))
            }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

/**
 * Convert a base64 string back to a File for upload
 */
export async function base64ToFile(
    base64: string,
    filename: string,
    mimeType: string
): Promise<File> {
    const res = await fetch(base64)
    const blob = await res.blob()
    return new File([blob], filename, { type: mimeType })
}
