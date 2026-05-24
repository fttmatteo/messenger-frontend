/**
 * Convierte un File o Blob a cadena base64 para almacenamiento en IndexedDB
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
 * Convierte una cadena base64 de vuelta a File para subida
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
