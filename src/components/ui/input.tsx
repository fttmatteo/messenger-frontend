/**
 * Componente Input - Shadcn/UI
 * 
 * Campo de entrada de texto estilizado con Tailwind CSS.
 * Soporta todos los tipos de input HTML nativos.
 * 
 * Características:
 * - Borde sutil con focus ring
 * - Placeholder en color muted
 * - Estilos para estados disabled
 * - Soporte para input[type="file"]
 * - Responsivo (texto más grande en móvil)
 * 
 * @example
 * // Input de texto
 * <Input placeholder="Nombre completo" />
 * 
 * @example
 * // Input de email
 * <Input type="email" placeholder="correo@ejemplo.com" />
 * 
 * @example
 * // Input deshabilitado
 * <Input disabled value="No editable" />
 */

import * as React from "react"
import { cn } from "@/utils/cn"

/**
 * Componente Input
 * 
 * Wrapper sobre el input nativo de HTML con estilos de Shadcn/UI.
 * Usa forwardRef para permitir referencias al elemento DOM.
 * 
 * @param className - Clases CSS adicionales
 * @param type - Tipo de input (text, email, password, etc.)
 * @param props - Resto de props del input HTML
 * @param ref - Referencia al elemento input DOM
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Layout y dimensiones
                    "flex h-9 w-full rounded-md border border-input",
                    // Fondo y padding
                    "bg-transparent px-3 py-1",
                    // Tipografía
                    "text-base md:text-sm",
                    // Sombra y transiciones
                    "shadow-sm transition-colors",
                    // Estilos para input type="file"
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                    // Texto de marcador de posición
                    "placeholder:text-muted-foreground",
                    // Estado focus
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    // Estado disabled
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
