import { useState } from "react"
import { useForm } from "react-hook-form"
import { ModeToggle } from "@/components/mode-toggle"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const loginSchema = z.object({
    userName: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
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
            setError(err.message || "Something went wrong")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-center">Inicio de sesión</CardTitle>
                        <ModeToggle />
                    </div>
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
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ingrese su contraseña"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
