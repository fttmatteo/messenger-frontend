import { useTheme } from "next-themes"
import { useDeviceType } from "@/hooks/use-device-type"
import { Card } from "@/components/ui/card"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function AppearancePage() {
    const { theme, setTheme } = useTheme()
    const { isIOS } = useDeviceType()

    return (
        <div className="">
            <div className={`${isIOS ? 'pb-[104px]' : 'pb-[92px]'}`}>
                <div className="p-4">
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
