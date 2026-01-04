import { Package } from "lucide-react"

interface FullScreenLoaderProps {
    message?: string
}

export function FullScreenLoader({ message = "Iniciando sesión..." }: FullScreenLoaderProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
                {/* Outer glowing ring */}
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />

                {/* Logo container with spin */}
                <div className="relative bg-card p-6 rounded-2xl shadow-2xl border border-border/50 flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="h-8 w-8 text-primary animate-bounce-slow" />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-xl font-semibold tracking-tight animate-pulse">
                            {message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Por favor espera un momento
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite ease-in-out;
                }
            `}} />
        </div>
    )
}
