/**
 * Componente Card - Shadcn/UI
 * 
 * Contenedor con borde, fondo y sombra para agrupar contenido relacionado.
 * Compuesto por subcomponentes para estructura semántica.
 * 
 * Subcomponentes:
 * - Card: Contenedor principal con borde redondeado
 * - CardHeader: Cabecera con padding superior
 * - CardTitle: Título en negrita
 * - CardDescription: Descripción en texto muted
 * - CardContent: Área de contenido principal
 * - CardFooter: Pie de card para acciones
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Título</CardTitle>
 *     <CardDescription>Descripción del card</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Contenido aquí...</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Acción</Button>
 *   </CardFooter>
 * </Card>
 */

import * as React from "react"
import { cn } from "@/utils/cn"

/**
 * Card - Contenedor principal
 * 
 * Proporciona un contenedor con borde, esquinas redondeadas,
 * fondo de tarjeta y sombra sutil.
 */
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-border bg-card text-card-foreground shadow",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

/**
 * CardHeader - Cabecera del Card
 * 
 * Contenedor flex para el título y descripción.
 * Incluye padding y espaciado vertical entre elementos.
 */
const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - Título del Card
 * 
 * Texto en negrita sin line-height extra.
 * Usar dentro de CardHeader.
 */
const CardTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - Descripción del Card
 * 
 * Texto secundario en color muted.
 * Usar dentro de CardHeader, debajo del título.
 */
const CardDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - Contenido principal del Card
 * 
 * Área con padding horizontal para el contenido.
 * Sin padding superior para fluir desde el header.
 */
const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Pie del Card
 * 
 * Contenedor flex para acciones (botones, links).
 * Alineación horizontal por defecto.
 */
const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
