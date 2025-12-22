/**
 * Formats a full name to show first name and initial of last name.
 * Example: "Juan Carlos Perez" → "Juan P."
 */
export function formatDisplayName(fullName: string): string {
    if (!fullName) return ""
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0]
    // Get first name and initial of last name
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
}

/**
 * Capitalizes the first letter of each word.
 * Example: "MUNDO YAMAHA" → "Mundo Yamaha"
 */
export function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
