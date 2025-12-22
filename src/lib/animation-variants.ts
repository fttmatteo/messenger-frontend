import type { Variants } from "framer-motion"

/**
 * Standard animation variants for list items (table rows, cards, etc.)
 * Used across list pages for consistent enter/exit animations.
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
 * Animation variants for fade in/out with scale effect.
 * Used for floating buttons and modals.
 */
export const fadeScaleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
}

/**
 * Animation variants for slide in from right.
 * Used for sidebars and drawers.
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
