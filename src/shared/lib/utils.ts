import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de CSS de forma condicional usando clsx y tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
