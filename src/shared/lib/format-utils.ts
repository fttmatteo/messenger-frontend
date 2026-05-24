/**
 * Formatea un nombre completo para mostrar el primer nombre e inicial del apellido.
 * Ejemplo: "Juan Carlos Perez" → "Juan P."
 */
export function formatDisplayName(fullName: string): string {
    if (!fullName) return ""
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]

    const firstName = parts[0]
    const secondInitial = parts[1].charAt(0).toUpperCase()
    return `${firstName} ${secondInitial}.`
}

/**
 * Capitaliza la primera letra de cada palabra.
 * Ejemplo: "MUNDO YAMAHA" → "Mundo Yamaha"
 */
export function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
