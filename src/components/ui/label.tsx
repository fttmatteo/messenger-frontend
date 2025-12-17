/**
 * Componente Label - Shadcn/UI
 * 
 * Etiqueta accesible para campos de formulario.
 * Construido sobre Radix UI Label para accesibilidad completa.
 * 
 * Características:
 * - Asociación automática con inputs (htmlFor)
 * - Estilos para estado disabled del input asociado
 * - Tipografía consistente con el sistema de diseño
 * 
 * @example
 * // Uso básico
 * <Label htmlFor="email">Correo electrónico</Label>
 * <Input id="email" type="email" />
 * 
 * @example
 * // Con input deshabilitado
 * <div>
 *   <Label htmlFor="disabled">Campo deshabilitado</Label>
 *   <Input id="disabled" disabled />
 * </div>
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

/**
 * Variantes del Label.
 * Define los estilos base y comportamientos para estados especiales.
 */
const labelVariants = cva(
    // Estilos base: texto pequeño, semibold, sin line-height extra
    // peer-disabled: reduce opacidad y cambia cursor cuando el input asociado está disabled
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Componente Label
 * 
 * Wrapper sobre Radix UI Label con estilos de Shadcn/UI.
 * 
 * @param className - Clases CSS adicionales
 * @param props - Props de Radix Label (incluye htmlFor)
 * @param ref - Referencia al elemento label DOM
 */
const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
