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
import { AlertCircle, Eye, EyeOff, Power, Moon, Sun } from "lucide-react"
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
import { useTheme } from "next-themes"

const loginSchema = z.object({
    userName: z.string().min(1, "El usuario es requerido"),
    password: z.string().min(1, "La contraseña es requerida"),
    rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const { login } = useAuth()
    const { setTheme, theme } = useTheme()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)

    const handleExit = () => {
        window.close()
        // Fallback for browsers preventing window.close()
        // Note: This mainly works for installed PWAs or windows opened by script
        if (!window.closed) {
            window.location.href = "about:blank"
        }
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
            await login(data)
            navigate("/")
        } catch (err: any) {
            setError(err.message || "Algo salió mal")
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background p-4">


            <Card className="w-full max-w-md relative pt-12">
                {/* Theme Toggle Left */}
                <div className="absolute top-4 left-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-10 w-10"
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Exit Button Right */}
                <div className="absolute top-4 right-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowExitDialog(true)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Power className="h-5 w-5" />
                    </Button>
                </div>
                <CardHeader>
                    <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                        <img src={logo} alt="PLAK Logo" className="h-20 w-20 object-contain" />
                    </div>
                    <div className="flex items-center justify-center">
                        <CardTitle className="text-2xl text-center">Inicio de sesíon</CardTitle>
                    </div>
                    <CardDescription className="text-center">
                        Ingrese sus credenciales para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="userName">Usuario</Label>
                            <Input
                                id="userName"
                                type="text"
                                placeholder="Ingrese su usuario"
                                {...register("userName")}
                            />
                            {errors.userName && (
                                <p className="text-sm text-red-500">{errors.userName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingrese su contraseña"
                                    {...register("password")}
                                    className="pr-8"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="rememberMe"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="rememberMe"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Recordar contraseña
                                </Label>
                            </div>
                            <Button variant="link" className="px-0 font-normal text-xs text-muted-foreground" type="button">
                                ¿Olvidó su contraseña?
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            ¿Tienes problemas para entrar? <span className="underline cursor-pointer">Contacta a soporte</span>
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
