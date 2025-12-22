import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { ModeToggle } from "@/components/mode-toggle"

const loginSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo se permiten números"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)

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
            setError(null)
            await login({
                document: parseInt(data.document, 10),
                password: data.password,
                rememberMe: data.rememberMe
            })
            navigate("/")
        } catch (err: any) {
            setError(err.message || "Algo salió mal")
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen h-screen bg-background p-4 overflow-hidden">
            <Card className="w-full max-w-[380px] relative shadow-lg border-border/50 my-auto">
                {/* Mode Toggle Button - Consistent Position */}
                <div className="absolute top-4 right-4 z-10">
                    <ModeToggle className="h-8 w-8" />
                </div>
                <CardHeader className="space-y-1 pb-2 md:pb-4 pt-12 md:pt-6">
                    <div className="flex flex-col items-center justify-center mb-2 md:mb-2">
                        <img src={logo} alt="PLAK Logo" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
                    </div>
                    <div className="flex items-center justify-center">
                        <CardTitle className="text-xl font-semibold text-center tracking-tight">Inicio de sesión</CardTitle>
                    </div>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        Ingrese sus credenciales para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 md:pb-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-3">
                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="document" className="text-sm font-medium text-foreground/80">Documento</Label>
                            <Input
                                id="document"
                                type="text"
                                inputMode="numeric"
                                placeholder="Ingrese su número de documento"
                                autoComplete="username"
                                {...register("document")}
                                className="h-10 text-sm"
                            />
                            {errors.document && (
                                <p className="text-xs text-red-500 font-medium">{errors.document.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingrese su contraseña"
                                    autoComplete="current-password"
                                    {...register("password")}
                                    className="pr-10 h-10 text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="rememberMe"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="rememberMe"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-4 w-4 rounded-sm"
                                        />
                                    )}
                                />
                                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground font-normal cursor-pointer">
                                    Recordar contraseña
                                </Label>
                            </div>
                            <Button variant="link" className="px-0 font-normal text-sm text-primary/80 h-auto" type="button">
                                ¿Olvidó su contraseña?
                            </Button>
                        </div>

                        <Button type="submit" className="w-full h-10 text-sm font-medium mt-2" disabled={isSubmitting}>
                            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground mt-4 pb-2 md:pb-0">
                            ¿Tienes problemas para entrar? <span className="underline cursor-pointer hover:text-foreground transition-colors">Contacta a soporte</span>
                        </div>
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
    )
}
