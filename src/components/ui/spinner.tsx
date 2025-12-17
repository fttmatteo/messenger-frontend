/**
 * Spinner - Componente de Carga Reutilizable
 * 
 * Indicador de carga animado en tres tamaños.
 * Utiliza el icono Loader2 de Lucide con animación spin.
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Props del componente Spinner
 */
interface SpinnerProps {
    /** Tamaño del spinner: sm (16px), md (32px), lg (48px) */
    size?: 'sm' | 'md' | 'lg'
    /** Clases CSS adicionales */
    className?: string
}

/**
 * Mapeo de tamaños a clases Tailwind
 */
const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
} as const

/**
 * Spinner Component
 * 
 * @example
 * // Uso básico
 * <Spinner />
 * 
 * // Con tamaño
 * <Spinner size="lg" />
 * 
 * // Con clases personalizadas
 * <Spinner className="text-blue-500" />
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
    return (
        <Loader2
            className={cn(
                'animate-spin text-slate-400',
                sizeClasses[size],
                className
            )}
        />
    )
}

/**
 * FullPageSpinner - Spinner centrado en pantalla completa
 * 
 * Útil para loading states de páginas o rutas.
 */
export function FullPageSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <Spinner size="lg" className="text-blue-500" />
        </div>
    )
}
