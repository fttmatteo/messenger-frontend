import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/shared/components/ui/button"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"

interface ImageViewerProps {
    src?: string | null
    images?: string[] | null
    alt?: string
    open: boolean
    onClose: () => void
    initialIndex?: number
}

export function ImageViewer({
    src,
    images,
    alt = "Visualizador de imagen",
    open,
    onClose,
    initialIndex = 0
}: ImageViewerProps) {
    const imageList = images && images.length > 0
        ? images
        : src
            ? [src]
            : []

    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    // Sincronizar el índice de la imagen activa cuando se abre o cambia el index inicial
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex)
        }
    }, [open, initialIndex])

    // Manejo de navegación por teclado
    useEffect(() => {
        if (!open || imageList.length === 0) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" && imageList.length > 1) {
                setCurrentIndex((prev) => (prev + 1) % imageList.length)
            } else if (e.key === "ArrowLeft" && imageList.length > 1) {
                setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
            } else if (e.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, imageList.length, onClose])

    if (imageList.length === 0) return null

    // Asegurar que el índice esté dentro del rango válido
    const activeIndex = Math.min(Math.max(0, currentIndex), imageList.length - 1)

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="relative z-[99999]">
                    {/* Fondo oscuro y blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99990]"
                    />

                    {/* Contenido principal del visualizador */}
                    <div className="fixed inset-0 z-[99991] flex items-center justify-center p-4 pointer-events-none">
                        {/* Botón de cerrar */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-[max(1rem,var(--safe-area-top,0px))] right-[max(1rem,var(--safe-area-right,0px))] text-white hover:bg-white/20 rounded-full h-10 w-10 pointer-events-auto z-[99995]"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Botón Anterior */}
                        {imageList.length > 1 && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="fixed left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/35 backdrop-blur-md rounded-full h-12 w-12 pointer-events-auto z-[99995] transition-colors border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
                                }}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}

                        {/* Contenedor de la Imagen */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-[90vw] max-h-[80vh] sm:max-w-[85vw] sm:max-h-[85vh] pointer-events-auto shadow-2xl flex items-center justify-center outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeIndex}
                                    src={imageList[activeIndex]}
                                    alt={alt}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="max-w-full max-h-[80vh] sm:max-h-[85vh] w-auto h-auto rounded-lg object-contain bg-black/50"
                                />
                            </AnimatePresence>
                        </motion.div>

                        {/* Botón Siguiente */}
                        {imageList.length > 1 && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="fixed right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/35 backdrop-blur-md rounded-full h-12 w-12 pointer-events-auto z-[99995] transition-colors border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentIndex((prev) => (prev + 1) % imageList.length)
                                }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        )}

                        {/* Indicador de página tipo píldora */}
                        {imageList.length > 1 && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 select-none z-[99995] shadow-lg">
                                {activeIndex + 1} / {imageList.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
