import { useState } from "react"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor, Check, ChevronRight, ChevronLeft, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

type ThemeOption = 'light' | 'dark' | 'system'
type SettingsView = 'main' | 'appearance'

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
        description: 'Tema con fondo blanco',
        icon: <Sun className="h-6 w-6" />
    },
    {
        value: 'dark',
        label: 'Oscuro',
        description: 'Tema con fondo oscuro',
        icon: <Moon className="h-6 w-6" />
    },
    {
        value: 'system',
        label: 'Sistema',
        description: 'Usa la preferencia del dispositivo',
        icon: <Monitor className="h-6 w-6" />
    }
]

function getThemeLabel(theme: string | undefined) {
    switch (theme) {
        case 'light': return 'Claro'
        case 'dark': return 'Oscuro'
        case 'system': return 'Sistema'
        default: return 'Sistema'
    }
}

export default function ConfiguracionPage() {
    const { theme, setTheme } = useTheme()
    const [view, setView] = useState<SettingsView>('main')

    // Main settings view
    if (view === 'main') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    {/* Settings List */}
                    <div className="p-4">
                        <Card className="border-border/50 overflow-hidden">
                            {/* Appearance Option */}
                            <button
                                onClick={() => setView('appearance')}
                                className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left touch-manipulation border-b border-border/30 last:border-b-0"
                            >
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Palette className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Apariencia</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {getThemeLabel(theme)}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>

                            {/* Future settings can be added here */}
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // Appearance settings view
    return (
        <div className="flex flex-col h-full">
            {/* Header with back button */}
            <div className="flex items-center gap-2 p-4 pb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView('main')}
                    className="h-9 w-9 rounded-lg"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-base font-semibold">Apariencia</h2>
            </div>

            <div className="flex-1 overflow-auto">
                {/* Theme Options */}
                <div className="px-4 pb-4">
                    <Card className="p-4 border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                            Tema
                        </p>

                        <div className="space-y-2">
                            {themeOptions.map((option) => {
                                const isSelected = theme === option.value
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left touch-manipulation",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border/40 bg-card hover:bg-muted/30"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "p-2.5 rounded-xl transition-colors",
                                                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-base text-foreground">
                                                {option.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {option.description}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
