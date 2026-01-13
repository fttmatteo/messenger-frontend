import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Palette, ChevronRight } from "lucide-react"

function getThemeLabel(theme: string | undefined) {
    switch (theme) {
        case 'light': return 'Claro'
        case 'dark': return 'Oscuro'
        case 'system': return 'Sistema'
        default: return 'Sistema'
    }
}

export default function ConfiguracionPage() {
    const { theme } = useTheme()
    const navigate = useNavigate()
    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4 p-4">
            <Card className="border-border/50 overflow-hidden">
                {/* Appearance Option */}
                <button
                    onClick={() => navigate('/messenger/configuracion/apariencia')}
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
                {/* Example: Notifications, Profile, etc. */}
            </Card>
        </div>
    )
}
