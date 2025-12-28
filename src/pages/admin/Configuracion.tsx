import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusColorPicker } from "@/components/settings/StatusColorPicker"
import { useStatusColors } from "@/context/StatusColorContext"
import { DEFAULT_STATUS_COLORS, getStatusLabel } from "@/lib/status-colors"
import { Settings, Palette, RotateCcw, CheckCircle2, Eye } from "lucide-react"
import { toast } from "sonner"

// Status order for display
const STATUS_ORDER = ['ASSIGNED', 'PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED', 'DELETED']

export default function Configuracion() {
    const { colors, updateColor, resetToDefaults, isModified } = useStatusColors()

    const handleResetAll = () => {
        resetToDefaults()
        toast.success('Colores restaurados a valores por defecto')
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
                        <p className="text-muted-foreground text-sm">
                            Personaliza el sistema según tus preferencias
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Status Colors Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Colores de Estados</CardTitle>
                                <CardDescription>
                                    Personaliza los colores que identifican cada estado de servicio en todo el sistema
                                </CardDescription>
                            </div>
                        </div>
                        {isModified && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetAll}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restaurar todo
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Color Pickers Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {STATUS_ORDER.map(status => (
                            <StatusColorPicker
                                key={status}
                                status={status}
                                color={colors[status] || DEFAULT_STATUS_COLORS[status]}
                                onColorChange={updateColor}
                            />
                        ))}
                    </div>

                    {/* Live Preview */}
                    <Separator />
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            Vista previa en tiempo real
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex flex-wrap gap-2">
                                {STATUS_ORDER.map(status => (
                                    <Badge
                                        key={status}
                                        style={{
                                            backgroundColor: colors[status] || DEFAULT_STATUS_COLORS[status],
                                            color: 'white'
                                        }}
                                    >
                                        {getStatusLabel(status)}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-4 mt-4">
                                {STATUS_ORDER.map(status => (
                                    <div key={status} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: colors[status] || DEFAULT_STATUS_COLORS[status] }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: colors[status] || DEFAULT_STATUS_COLORS[status] }}
                                        >
                                            {getStatusLabel(status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    {isModified && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Los cambios se guardan automáticamente y se aplican en todo el sistema
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
