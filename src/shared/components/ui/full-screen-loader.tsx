import logo from "@/assets/logo.png"

interface FullScreenLoaderProps {
    message?: string
}

export function FullScreenLoader({ message = "Iniciando sesión..." }: FullScreenLoaderProps) {
    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
            role="alert"
            aria-busy="true"
            aria-label={message}
        >
            <div className="relative flex flex-col items-center">



                <div className="relative bg-card p-6 rounded-2xl shadow-2xl border border-border/50 flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 w-10 object-contain animate-bounce-slow"
                            />
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

        </div>
    )
}
