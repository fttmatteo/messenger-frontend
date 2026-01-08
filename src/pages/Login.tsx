import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, HelpCircle, Package } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/components/mode-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import LoginMobile from "@/pages/mobile/LoginMobile"
import { getErrorMessage } from "@/lib/error-utils"
import { FullScreenLoader } from "@/components/ui/full-screen-loader"

const loginSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo se permiten números"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const isMobile = useIsMobile()
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [logoError, setLogoError] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login({
                document: parseInt(data.document, 10),
                password: data.password,
                rememberMe: data.rememberMe
            })
            navigate("/")
        } catch (error) {
            const err = error as any;
            
            // Manejar rate limiting (429)
            if (err.statusCode === 429) {
                // Mostrar notificación persistente de Sonner
                const toastId = toast.error(
                    `Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.`,
                    {
                        position: 'top-center',
                        duration: Infinity, // Persistente mientras esté bloqueado
                        closeButton: false,
                    }
                );
                
                // Contar hacia atrás y actualizar el toast
                let counter = 15;
                const interval = setInterval(() => {
                    counter--;
                    
                    if (counter <= 0) {
                        clearInterval(interval);
                        toast.dismiss(toastId);
                        toast.success('Cuenta desbloqueada. Puedes intentar de nuevo.', {
                            position: 'top-center',
                            duration: 4000,
                        });
                        return;
                    }
                    
                    // Actualizar el toast con el tiempo restante
                    toast.error(
                        `Demasiados intentos fallidos. Intenta de nuevo en ${counter} minuto${counter !== 1 ? 's' : ''}`,
                        {
                            id: toastId,
                            position: 'top-center',
                            duration: Infinity,
                            closeButton: false,
                        }
                    );
                }, 60000); // Actualizar cada minuto
            } else {
                // Otros errores
                toast.error(getErrorMessage(error), {
                    position: 'top-center',
                    duration: 4000
                })
            }
        }
    }

    // Show loading while detecting device type
    if (isMobile === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    // Render mobile version on mobile devices
    if (isMobile) {
        return <LoginMobile />
    }

    const handleExit = () => {
        window.open('', '_self', '');
        window.close();
        const win = window.open("about:blank", "_self");
        if (win) win.close();
        setTimeout(() => {
            if (window.location) {
                window.location.href = "about:blank";
            }
        }, 300);
    }

    return (
        <>
            {isSubmitting && <FullScreenLoader />}
            <div className="flex items-center justify-center h-screen bg-background p-2 sm:p-4 overflow-auto">
                <Card className="w-full max-w-[380px] max-h-[90vh] relative shadow-lg border-border/50">
                    {/* Help Button - Top Left */}
                    <div className="absolute top-3 left-3 z-10">
                        <Button variant="ghost" size="icon" className="rounded-lg" type="button" aria-label="Ayuda">
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </div>
                    {/* Mode Toggle Button - Consistent Position */}
                    <div className="absolute top-3 right-3 z-10">
                        <ModeToggle showLabel={false} />
                    </div>
                    <CardHeader className="space-y-1 pb-2 pt-10 sm:pt-6">
                        <div className="flex flex-col items-center justify-center mb-1 sm:mb-2">
                            {/* Fallback icon shown while loading or on error */}
                            {(!logoLoaded || logoError) && (
                                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center bg-primary/10 rounded-lg">
                                    <Package className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                                </div>
                            )}
                            {/* Actual logo image */}
                            <img
                                src={logo}
                                alt="PLAK Logo"
                                className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain ${logoLoaded && !logoError ? '' : 'hidden'}`}
                                onLoad={() => setLogoLoaded(true)}
                                onError={() => setLogoError(true)}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <CardTitle className="text-2xl sm:text-3xl font-semibold text-center tracking-tight">Inicio de sesión</CardTitle>
                        </div>
                        <CardDescription className="text-center text-base sm:text-lg text-muted-foreground">
                            Ingrese sus credenciales
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 sm:pb-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="document" className="text-base sm:text-lg font-medium text-foreground/90">Documento</Label>
                                    {errors.document && (
                                        <p className="text-sm text-red-500 font-medium">{errors.document.message}</p>
                                    )}
                                </div>
                                <Input
                                    id="document"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ingrese su número de documento"
                                    autoComplete="username"
                                    {...register("document")}
                                    className="h-11 sm:h-12 text-base"
                                />
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-base sm:text-lg font-medium text-foreground/90">Contraseña</Label>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingrese su contraseña"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        className="pr-10 h-11 sm:h-12 text-base"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name="rememberMe"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="rememberMe"
                                                name={field.name}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-5 w-5 rounded-sm"
                                            />
                                        )}
                                    />
                                    <Label htmlFor="rememberMe" className="text-sm sm:text-base text-muted-foreground font-normal cursor-pointer">
                                        Recordar contraseña
                                    </Label>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 sm:h-12 text-base sm:text-lg font-medium mt-1.5 sm:mt-2" disabled={isSubmitting}>
                                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Salir de la aplicación?</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro que deseas salir? Esto cerrará la aplicación.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleExit} className="bg-red-500 text-white hover:bg-red-600">Salir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
