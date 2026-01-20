import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

interface ImageViewerProps {
    src: string | null
    alt?: string
    open: boolean
    onClose: () => void
}

export function ImageViewer({ src, alt = "Visualizador de imagen", open, onClose }: ImageViewerProps) {
    if (!src) return null

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="relative z-[99999]">

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99990]"
                    />

                    <div className="fixed inset-0 z-[99991] flex items-center justify-center p-4 pointer-events-none">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 pointer-events-auto z-[99995]"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-[95vw] max-h-[90vh] pointer-events-auto shadow-2xl flex items-center justify-center outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[85vh] w-auto h-auto rounded-lg object-contain bg-black/50"
                            />
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
