import { Smartphone, Monitor, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import logo from "@/assets/logo.png"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export function MobileOnlyGuard() {
    const { logout } = useAuth()

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
            <Card className="max-w-5xl w-full shadow-2xl border-2 overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Column 1: Visuals & Header */}
                    <div className="bg-muted/30 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
                        <div className="mb-6">
                            <img src={logo} alt="PLAK" className="h-20 w-20 object-contain drop-shadow-md" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">
                            Dispositivo no compatible
                        </h2>

                        <div className="flex items-center justify-center gap-4 my-8">
                            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                                <Monitor className="h-10 w-10 text-red-500" />
                            </div>
                            <span className="text-3xl text-muted-foreground">→</span>
                            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Smartphone className="h-10 w-10 text-green-500" />
                            </div>
                        </div>

                        <p className="text-muted-foreground max-w-sm">
                            Esta aplicación está optimizada para el uso exclusivo en smartphones y tablets.
                        </p>
                    </div>

                    {/* Column 2: Information & Action */}
                    <div className="p-6 flex flex-col justify-center h-full">
                        <CardContent className="space-y-6 p-0">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Experiencia Móvil Requerida
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Para garantizar el correcto funcionamiento de las características de geolocalización, cámara y notificaciones en tiempo real, es necesario acceder desde un dispositivo móvil.
                                </p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4">
                                <h4 className="text-amber-800 dark:text-amber-200 text-sm font-semibold mb-1">
                                    ¿Por qué esta restricción?
                                </h4>
                                <p className="text-amber-700 dark:text-amber-300/80 text-xs">
                                    El flujo de trabajo de los mensajeros depende de sensores y hardware específicos de dispositivos móviles que no están disponibles o no funcionan igual en navegadores de escritorio.
                                </p>
                            </div>

                            <div className="pt-4 mt-auto">
                                <Button
                                    variant="outline"
                                    onClick={logout}
                                    className="w-full gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar sesión y volver más tarde
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </div>
    )
}
