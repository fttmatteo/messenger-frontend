import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusColorPicker } from "@/components/settings/StatusColorPicker"
import { useStatusColors } from "@/hooks/use-status-colors"
import { DEFAULT_STATUS_COLORS, getStatusLabel, getStatusPillBackground } from "@/lib/status-colors"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Palette, RotateCcw, ChevronRight, Sun, Moon, Monitor, Check } from "lucide-react"
import { showToast } from "@/config/toast-config"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { APP_CONFIG } from "@/lib/app-config"


// Orden de estados para visualización
const STATUS_ORDER = ['ASSIGNED', 'PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED', 'DELETED']

// Opciones de tema para la sección de apariencia
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

// Secciones de configuración - agregar más aquí en el futuro
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

/**
 * Página de configuración global para administradores.
 * Permite gestionar la apariencia (tema claro/oscuro) y la personalización
 * de colores para los estados de los servicios.
 * Utiliza parámetros de búsqueda en la URL para navegar entre secciones.
 */
export default function Configuracion() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeSection = searchParams.get('section')
    const { colors, updateColor, resetToDefaults, isModified } = useStatusColors()
    const { theme, setTheme } = useTheme()

    const setActiveSection = (section: string | null) => {
        if (section) {
            setSearchParams({ section })
        } else {
            setSearchParams({})
        }
    }

    const getSectionLabel = (sectionId: string | null) => {
        switch (sectionId) {
            case 'appearance': return 'Apariencia'
            case 'colors': return 'Colores'
            default: return 'Configuración'
        }
    }

    const handleResetAll = () => {
        resetToDefaults()
        showToast.success('Colores restaurados a valores por defecto', { id: 'reset-colors-success' })
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
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

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">
                        {activeSection === 'colors' ? 'Colores de estados' : activeSection === 'appearance' ? 'Apariencia' : 'Configuración'}
                    </h1>
                </div>

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


            {activeSection === null ? (
                <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                    <CardContent className="p-0 space-y-2 overflow-y-auto">
                        {SETTINGS_SECTIONS.map((section) => {
                            const IconComponent = section.icon
                            return (
                                <div
                                    key={section.id}
                                    className="flex items-center gap-4 p-4 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
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


                    <div className="mt-auto py-6 text-center">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            {APP_CONFIG.name} v{APP_CONFIG.version}
                        </p>
                    </div>
                </Card>
            ) : activeSection === 'appearance' ? (
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
                <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                    <CardHeader className="py-2 px-4">
                        <CardDescription>
                            Click en un estado para cambiar su color
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-y-auto">
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
