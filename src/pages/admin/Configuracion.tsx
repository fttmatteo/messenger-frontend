import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusColorPicker } from "@/components/settings/StatusColorPicker"
import { useStatusColors } from "@/hooks/useStatusColors"
import { DEFAULT_STATUS_COLORS, getStatusLabel, getStatusPillBackground } from "@/lib/status-colors"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Palette, RotateCcw, ChevronRight } from "lucide-react"
import { toast } from "sonner"

// Status order for display
const STATUS_ORDER = ['ASSIGNED', 'PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED', 'DELETED']

// Settings sections - add more here in the future
const SETTINGS_SECTIONS = [
    {
        id: 'colors',
        title: 'Colores de Estados',
        description: 'Personaliza los colores de cada estado de servicio',
        icon: Palette
    },
]

export default function Configuracion() {
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const { colors, updateColor, resetToDefaults, isModified } = useStatusColors()

    const handleResetAll = () => {
        resetToDefaults()
        toast.success('Colores restaurados a valores por defecto')
    }

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Header - Same pattern as other pages */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Breadcrumb/Back navigation */}
                {activeSection === null ? (
                    <AdminBreadcrumb segments={[{ label: "Configuración" }]} />
                ) : (
                    <AdminBreadcrumb
                        segments={[
                            { label: "Configuración", onClick: () => setActiveSection(null) },
                            { label: "Colores de Estados" }
                        ]}
                    />
                )}

                {/* Center: Title */}
                <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold">
                        {activeSection === 'colors' ? 'Colores de Estados' : 'Configuración'}
                    </h1>
                </div>

                {/* Right: Actions (empty spacer or button) */}
                <div className="w-[140px] flex justify-end">
                    {activeSection === 'colors' && isModified && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetAll}
                            className="gap-2 h-8 text-xs"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Restaurar
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {activeSection === null ? (
                /* Settings Menu */
                <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                    <CardContent className="p-4 space-y-2">
                        {SETTINGS_SECTIONS.map((section) => {
                            const IconComponent = section.icon
                            return (
                                <div
                                    key={section.id}
                                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{section.title}</p>
                                        <p className="text-sm text-muted-foreground">{section.description}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ) : activeSection === 'colors' ? (
                /* Status Colors Section */
                <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                    <CardHeader className="py-2 px-4">
                        <CardDescription>
                            Click en un estado para cambiar su color
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4">
                        {/* Color Pickers Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {STATUS_ORDER.map(status => (
                                <StatusColorPicker
                                    key={status}
                                    status={status}
                                    color={colors[status] || DEFAULT_STATUS_COLORS[status]}
                                    onColorChange={updateColor}
                                />
                            ))}
                        </div>

                        {/* Compact Preview - inline at bottom - same style as content headers */}
                        <div className="mt-auto pt-3 border-t flex items-center gap-4 flex-wrap">
                            <span className="text-xs text-muted-foreground">Vista previa:</span>
                            {STATUS_ORDER.map(status => (
                                <div
                                    key={status}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: getStatusPillBackground(status, colors, 0.15) }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: colors[status] || DEFAULT_STATUS_COLORS[status] }}
                                    />
                                    <span className="text-sm font-medium">
                                        {getStatusLabel(status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}
