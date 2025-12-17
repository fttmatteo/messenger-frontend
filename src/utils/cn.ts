import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de Tailwind CSS de forma segura.
 * 
 * Esta función combina `clsx` (para nombres de clase condicionales)
 * con `tailwind-merge` (para resolver conflictos entre clases de Tailwind).
 * 
 * @param inputs - Lista de clases CSS, pueden ser strings, objetos o arrays.
 * @returns String con las clases combinadas y sin conflictos.
 * 
 * @example
 * // Uso básico
 * cn("px-2 py-1", "text-sm")
 * // Resultado: "px-2 py-1 text-sm"
 * 
 * @example
 * // Con condiciones
 * cn("base-class", isActive && "bg-primary", "text-sm")
 * // Resultado: "base-class bg-primary text-sm" (si isActive es true)
 * 
 * @example
 * // Resolviendo conflictos (tailwind-merge)
 * cn("px-2 px-4")
 * // Resultado: "px-4" (la última clase gana)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
