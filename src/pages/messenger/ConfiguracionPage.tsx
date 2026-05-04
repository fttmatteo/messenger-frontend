import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Palette, ChevronRight } from "lucide-react"
import { APP_CONFIG } from "@/lib/app-config"

function getThemeLabel(theme: string | undefined) {
    switch (theme) {
        case 'light': return 'Claro'
        case 'dark': return 'Oscuro'
        case 'system': return 'Sistema'
        default: return 'Sistema'
    }
}

/**
 * Página de configuración principal para la aplicación del mensajero.
 * Sirve como menú central para acceder a diferentes secciones de ajustes
 * como la apariencia, y muestra información sobre la versión de la aplicación.
 */
export default function ConfiguracionPage() {
    const { theme } = useTheme()
    const navigate = useNavigate()

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-6 p-4 pb-safe animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-x-hidden">
            <div className="space-y-4">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.18em] px-1">
                    General
                </p>

                <Card className="border-border/40 bg-card overflow-hidden rounded-2xl shadow-sm">
                    <button
                        onClick={() => navigate('/messenger/configuracion/apariencia')}
                        className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 active:scale-[0.98] transition-all text-left touch-manipulation group"
                    >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                            <Palette className="h-5 w-5" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm tracking-tight text-foreground/90">Apariencia</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wide">
                                Tema: {getThemeLabel(theme)}
                            </p>
                        </div>

                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted group-hover:bg-accent/20 transition-colors">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </button>

                </Card>
            </div>

            <div className="mt-auto py-6 text-center">
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    {APP_CONFIG.name} v{APP_CONFIG.version}
                </p>
            </div>
        </div>
    )
}
