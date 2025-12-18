import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { serviceDeliveryService } from "@/services/service.service"
import { dealershipService } from "@/services/dealership.service"
import { employeeService } from "@/services/employee.service"
import type { Dealership } from "@/types/dealership.types"
import type { Employee } from "@/types/employee.types"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Bike, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Form validation schema
const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario es obligatorio"),
    messengerDocument: z.string().optional(),
    manualPlateNumber: z.string().optional(),
    image: z.instanceof(File, { message: "La imagen es obligatoria" })
})

type FormValues = z.infer<typeof formSchema>

export default function CreateServicio() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const isAdmin = user?.role === 'ADMIN'

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealershipId: "",
            messengerDocument: "",
            manualPlateNumber: "",
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true)
                const [dealershipsData, employeesData] = await Promise.all([
                    dealershipService.getAll(),
                    employeeService.getAll()
                ])
                setDealerships(dealershipsData)

                // Filter only messengers for selection
                const messengersList = employeesData.filter(e => e.role === 'MESSENGER')
                setMessengers(messengersList)
            } catch (error: any) {
                toast.error("Error al cargar datos", {
                    description: error.message
                })
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [])

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            await serviceDeliveryService.create({
                image: values.image,
                dealershipId: values.dealershipId,
                messengerDocument: values.messengerDocument,
                manualPlateNumber: values.manualPlateNumber || undefined
            })

            toast.success("Servicio creado exitosamente", {
                description: values.manualPlateNumber
                    ? `Placa manual: ${values.manualPlateNumber}`
                    : "Procesando detección OCR..."
            })

            navigate("/admin/servicios")
        } catch (error: any) {
            toast.error("Error al crear servicio", {
                description: error.response?.data?.message || error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Archivo inválido", {
                    description: "Por favor selecciona una imagen"
                })
                return
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Archivo muy grande", {
                    description: "El tamaño máximo es 5MB"
                })
                return
            }

            form.setValue("image", file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        form.setValue("image", undefined as any)
        setImagePreview(null)
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/servicios">
                                Servicios
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Crear</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Crear Servicio de Entrega</h1>
                <p className="text-muted-foreground mt-1">
                    Registra una nueva entrega de placa vehicular
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Información del Servicio</CardTitle>
                    <CardDescription>
                        Sube una imagen de la placa para detección automática o ingresa el número manualmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Image Upload */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Imagen de la Placa *</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                {!imagePreview ? (
                                                    <div className="flex items-center justify-center w-full">
                                                        <label
                                                            htmlFor="image-upload"
                                                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                                                        >
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                                                <p className="mb-2 text-sm text-muted-foreground">
                                                                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    PNG, JPG, WEBP (MAX. 5MB)
                                                                </p>
                                                            </div>
                                                            <input
                                                                id="image-upload"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-64 object-contain rounded-lg border"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2"
                                                            onClick={clearImage}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            La imagen será analizada para detectar el número de placa automáticamente
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Manual Plate Number */}
                            <FormField
                                control={form.control}
                                name="manualPlateNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Placa (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ABC123"
                                                {...field}
                                                className="font-mono uppercase"
                                                maxLength={7}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Si ingresas la placa manualmente, se omitirá la detección OCR
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dealership Select */}
                            <FormField
                                control={form.control}
                                name="dealershipId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concesionario *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={loadingData}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un concesionario" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dealerships.map((dealership) => (
                                                    <SelectItem
                                                        key={dealership.idDealership}
                                                        value={String(dealership.idDealership)}
                                                    >
                                                        {dealership.name} - {dealership.zone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Destino de la entrega
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Messenger Select (Admin only) */}
                            {isAdmin && (
                                <FormField
                                    control={form.control}
                                    name="messengerDocument"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensajero *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un mensajero" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {messengers.map((messenger) => (
                                                        <SelectItem
                                                            key={messenger.idEmployee}
                                                            value={String(messenger.document)}
                                                        >
                                                            {messenger.fullName} - {messenger.document}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Empleado asignado a la entrega
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={loading || loadingData}
                                    className="flex-1 sm:flex-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Bike className="mr-2 h-4 w-4" />
                                            Crear Servicio
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/servicios")}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
