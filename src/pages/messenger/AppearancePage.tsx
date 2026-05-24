import { useTheme } from "next-themes"
import { Card } from "@/shared/components/ui/card"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type ThemeOption = 'light' | 'dark' | 'system'

interface ThemeOptionItem {
    value: ThemeOption
    label: string
    description: string
    icon: React.ReactNode
}

const themeOptions: ThemeOptionItem[] = [
    {
        value: 'light',
        label: 'Claro',
        description: 'Fondo blanco',
        icon: <Sun className="h-6 w-6" strokeWidth={2.5} />
    },
    {
        value: 'dark',
        label: 'Oscuro',
        description: 'Fondo oscuro',
        icon: <Moon className="h-6 w-6" strokeWidth={2.5} />
    },
    {
        value: 'system',
        label: 'Sistema',
        description: 'Automático',
        icon: <Monitor className="h-6 w-6" strokeWidth={2.5} />
    }
]

/**
 * Página de configuración de apariencia para la interfaz del mensajero.
 * Permite al usuario elegir entre temas claro, oscuro o sincronizado con el sistema.
 * El cambio se aplica instantáneamente en toda la aplicación.
 */
export default function AppearancePage() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex flex-col flex-1 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-x-hidden">
            <div className="space-y-6">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 mb-4">
                        Modo de interfaz
                    </p>

                    <div className="grid gap-3">
                        {themeOptions.map((option) => {
                            const isSelected = theme === option.value
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={cn(
                                        "relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left touch-manipulation active:scale-[0.98] border",
                                        isSelected
                                            ? "border-primary/40 bg-primary/10 shadow-sm"
                                            : "border-border/40 bg-card hover:bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                                            isSelected
                                                ? "bg-primary text-primary-foreground scale-110"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {option.icon}
                                    </div>

                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-semibold text-sm tracking-tight transition-colors",
                                            isSelected ? "text-primary" : "text-foreground"
                                        )}>
                                            {option.label}
                                        </p>
                                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                        isSelected
                                            ? "border-primary bg-primary"
                                            : "border-muted-foreground/20 bg-transparent"
                                    )}>
                                        {isSelected && (
                                            <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <Card className="p-4 border-dashed border-2 border-muted bg-transparent rounded-2xl">
                    <p className="text-[11px] text-muted-foreground leading-relaxed text-center font-medium italic">
                        La apariencia se guardará automáticamente y se sincronizará entre tus dispositivos.
                    </p>
                </Card>
            </div>
        </div>
    )
}
