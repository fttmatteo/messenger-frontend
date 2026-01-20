import * as z from "zod"

/**
 * Lista de zonas geográficas predefinidas para clasificar los concesionarios.
 */
export const ZONES = [
    { value: "NORTE", label: "Norte" },
    { value: "SUR", label: "Sur" },
    { value: "CENTRO", label: "Centro" },
]

/**
 * Esquema de validación para el formulario de creación/edición de concesionarios.
 * Incluye reglas de longitud mínima y formatos específicos para dirección y teléfono.
 */
export const dealershipSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    address: z.string().min(1, "La dirección es requerida").min(10, "La dirección debe ser más detallada"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    zone: z.string().min(1, "La zona es requerida"),
})

export type DealershipFormValues = z.infer<typeof dealershipSchema>
