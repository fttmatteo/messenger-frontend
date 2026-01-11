import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusColorPicker } from "@/components/settings/StatusColorPicker"
import { useStatusColors } from "@/hooks/use-status-colors"
import { DEFAULT_STATUS_COLORS, getStatusLabel, getStatusPillBackground } from "@/lib/status-colors"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Palette, RotateCcw, ChevronRight, Sun, Moon, Monitor, Check } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Status order for display
const STATUS_ORDER = ['ASSIGNED', 'PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED', 'DELETED']

// Theme options for appearance section
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
        icon: <Sun className="h-5 w-5" />
    },
    {
        value: 'dark',
        label: 'Oscuro',
        description: 'Tema con fondo oscuro',
        icon: <Moon className="h-5 w-5" />
    },
    {
        value: 'system',
        label: 'Sistema',
        description: 'Usa la preferencia del dispositivo',
        icon: <Monitor className="h-5 w-5" />
    }
]

// Settings sections - add more here in the future
const SETTINGS_SECTIONS = [
    {
        id: 'appearance',
        title: 'Apariencia',
        description: 'Configura el tema de la aplicación',
        icon: Sun
    },
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
    const { theme, setTheme } = useTheme()

    const getSectionLabel = (sectionId: string | null) => {
        switch (sectionId) {
            case 'appearance': return 'Apariencia'
            case 'colors': return 'Colores'
            default: return 'Configuración'
        }
    }

    const handleResetAll = () => {
        resetToDefaults()
        toast.success('Colores restaurados a valores por defecto', { id: 'reset-colors-success' })
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            {/* Header: Breadcrumb left, Title center, Actions right */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                {/* Left: Navigation */}
                <div className="flex-1">
                    {activeSection === null ? (
                        <AdminBreadcrumb segments={[{ label: "Configuración" }]} />
                    ) : (
                        <AdminBreadcrumb
                            segments={[
                                { label: "Configuración", onClick: () => setActiveSection(null) },
                                { label: getSectionLabel(activeSection) }
                            ]}
                        />
                    )}
                </div>

                {/* Center: Title */}
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">
                        {activeSection === 'colors' ? 'Colores de estados' : activeSection === 'appearance' ? 'Apariencia' : 'Configuración'}
                    </h1>
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex justify-end">
                    {activeSection === 'colors' && isModified && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetAll}
                            className="gap-2 h-8 text-xs shrink-0"
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
                    <CardContent className="p-4 space-y-2 overflow-y-auto">
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
            ) : activeSection === 'appearance' ? (
                /* Appearance Section */
                <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                    <CardHeader className="py-2 px-4">
                        <CardDescription>
                            Selecciona el tema de la aplicación
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {themeOptions.map((option) => {
                                const isSelected = theme === option.value
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border/40 bg-card hover:bg-muted/30"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "p-2.5 rounded-lg transition-colors",
                                                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-foreground">
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
                    <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-y-auto">
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
