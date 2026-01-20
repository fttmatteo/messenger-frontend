import type { Variants } from "framer-motion"

/**
 * Variantes de animación estándar para elementos de lista (filas de tabla, tarjetas, etc.)
 * Usadas en páginas de listados para animaciones consistentes de entrada/salida.
 */
export const listItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
}

/**
 * Variantes de animación para aparecer/desaparecer con efecto de escala.
 * Usadas para botones flotantes y modales.
 */
export const fadeScaleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
}

/**
 * Variantes de animación para deslizar desde la derecha.
 * Usadas para barras laterales y cajones.
 */
export const slideInRightVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: { duration: 0.2 },
    },
}
