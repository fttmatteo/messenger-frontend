import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de CSS de forma condicional usando clsx y tailwind-merge.
 * @param inputs - Lista de clases o condiciones.
 * @returns Cadena de clases combinada y optimizada para Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
