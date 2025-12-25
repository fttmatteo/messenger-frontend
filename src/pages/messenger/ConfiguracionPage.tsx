import { Settings } from "lucide-react"

export default function ConfiguracionPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Próximamente</h2>
            <p className="text-sm text-muted-foreground mt-2">
                La configuración estará disponible pronto.
            </p>
        </div>
    )
}

