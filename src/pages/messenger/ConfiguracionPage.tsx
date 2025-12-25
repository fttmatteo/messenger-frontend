import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    User,
    Bell,
    Moon,
    MapPin,
    Info,
    ChevronRight
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ConfiguracionPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="flex flex-col h-full p-3 gap-3 overflow-auto">
            {/* User Info Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cuenta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Documento</span>
                        <span className="text-sm font-medium">{user?.document || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">ID</span>
                        <span className="text-sm font-medium">{user?.id || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rol</span>
                        <span className="text-sm font-medium capitalize">{user?.role?.toLowerCase() || 'Mensajero'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Preferencias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="notifications" className="text-sm">Notificaciones</Label>
                        </div>
                        <Switch id="notifications" defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="darkmode" className="text-sm">Modo oscuro</Label>
                        </div>
                        <Switch id="darkmode" />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="gps" className="text-sm">GPS activo al iniciar</Label>
                        </div>
                        <Switch id="gps" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* History Links */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Historial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 -mx-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-between h-10 px-2"
                        onClick={() => navigate('/messenger/historial-estadisticas')}
                    >
                        <span className="text-sm">Historial de estadísticas</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-between h-10 px-2"
                        onClick={() => navigate('/messenger/historial-recorrido')}
                    >
                        <span className="text-sm">Historial de recorrido</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </CardContent>
            </Card>

            {/* App Info */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Información
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Versión</span>
                        <span className="text-sm font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Build</span>
                        <span className="text-sm font-mono text-muted-foreground">{import.meta.env.MODE}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
