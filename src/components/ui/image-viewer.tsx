import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ImageViewerProps {
    src: string | null
    alt?: string
    open: boolean
    onClose: () => void
}

export function ImageViewer({ src, alt = "Visualizador de imagen", open, onClose }: ImageViewerProps) {
    if (!src) return null

    return (
        <AnimatePresence>
            {open && (
                <div className="relative z-[100]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Content Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-full max-h-[90vh] pointer-events-auto shadow-2xl"
                        >
                            {/* Close Button */}
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-12 right-0 md:-right-12 rounded-full shadow-lg"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            {/* Image */}
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[80vh] rounded-lg object-contain bg-black/50"
                            />
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
