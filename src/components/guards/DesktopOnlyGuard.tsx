import { Smartphone, Monitor, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import logo from "@/assets/logo.png"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

/**
 * Protector de pantalla que restringe el acceso solo a dispositivos de escritorio.
 * Muestra un mensaje informativo si se accede desde un dispositivo móvil.
 */
export function DesktopOnlyGuard() {
    const { logout } = useAuth()

    return (
        <div className="h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <Card className="max-w-md w-full shadow-2xl border-2 max-h-[95vh] flex flex-col">
                <CardHeader className="text-center space-y-2 sm:space-y-4 shrink-0 pb-2 sm:pb-6">
                    <div className="flex justify-center">
                        <img src={logo} alt="PLAK" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                        Solo Escritorio
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar px-4 sm:px-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="p-3 sm:p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                            <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                        </div>
                        <span className="text-2xl sm:text-3xl text-muted-foreground">→</span>
                        <div className="p-3 sm:p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Monitor className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
                        </div>
                    </div>

                    <div className="text-center space-y-2 sm:space-y-3">
                        <p className="text-base sm:text-lg font-medium">
                            El panel de administrador está diseñado para escritorios.
                        </p>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Por favor, accede desde un ordenador para gestionar el sistema.
                        </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
                        <p className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm text-center">
                            <strong>¿Por qué solo escritorio?</strong><br />
                            La gestión avanzada requiere una pantalla grande para visualizar tablas, mapas y estadísticas correctamente.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pt-2 pb-4 sm:pb-6 shrink-0 z-10 bg-card rounded-b-xl">
                    <Button
                        variant="outline"
                        onClick={logout}
                        className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full sm:w-auto"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
