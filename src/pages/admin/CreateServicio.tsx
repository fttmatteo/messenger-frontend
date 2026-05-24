import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import { dealershipService } from "@/features/dealership/services/dealership.service"
import { employeeService } from "@/features/employee/services/employee.service"
import type { Dealership } from "@/features/dealership/types/dealership.types"
import type { Employee } from "@/features/employee/types/employee.types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { useSmartLocation } from "@/features/tracking/hooks/use-smart-location"
import { AdminBreadcrumb } from "@/shared/components/ui/admin-breadcrumb"

const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario destino es obligatorio"),
    originDealershipId: z.string().min(1, "El concesionario origen es obligatorio"),
    messengerId: z.string().min(1, "El mensajero es obligatorio"),
    manualPlateNumber: z.string().min(10, "El chasis debe tener mínimo 10 caracteres").max(20, "El chasis no puede tener más de 20 caracteres"),
}).refine((data) => data.originDealershipId !== data.dealershipId, {
    message: "El concesionario origen y destino no pueden ser el mismo",
    path: ["originDealershipId"],
})

type FormValues = z.infer<typeof formSchema>

export default function AdminCreateServicio() {
    const navigate = useNavigate()
    const { setSuccess, setError } = useAdminUI()
    const chasisInputRef = useRef<HTMLInputElement>(null)
    const { getCurrentLocation } = useSmartLocation()

    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [loadingData, setLoadingData] = useState(true)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealershipId: "",
            originDealershipId: "",
            messengerId: "",
            manualPlateNumber: "",
        },
    })

    const groupedDealerships = useMemo(() => {
        const groups: Record<string, Dealership[]> = {}
        dealerships.forEach(d => {
            const zone = d.zone || 'Sin Zona'
            if (!groups[zone]) {
                groups[zone] = []
            }
            groups[zone].push(d)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [dealerships])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true)
                const [dealershipsData, employeesData] = await Promise.all([
                    dealershipService.getAll(),
                    employeeService.getAll()
                ])
                setDealerships(dealershipsData)
                setMessengers(employeesData.filter(e => e.role === 'MESSENGER'))
            } catch (error) {
                setError(getErrorMessage(error))
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [setError])

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            let latitude: number | undefined
            let longitude: number | undefined
            try {
                const loc = await getCurrentLocation()
                latitude = loc.latitude
                longitude = loc.longitude
            } catch {
                // La ubicación es opcional: si falla, se continúa sin ella
            }

            await serviceDeliveryService.create({
                dealershipId: values.dealershipId,
                originDealershipId: values.originDealershipId,
                messengerDocument: values.messengerId,
                manualPlateNumber: values.manualPlateNumber,
                latitude,
                longitude
            })

            setSuccess("Servicio creado exitosamente")
            navigate("/admin/servicios")
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Servicios", href: "/admin/servicios" },
                        { label: "Nuevo" }
                    ]} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Nuevo servicio</h1>
                </div>
                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold flex items-center gap-2">
                        Información del servicio
                    </CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                        <CardContent className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-4xl w-full">
                                <FormField
                                    control={form.control}
                                    name="manualPlateNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <Label htmlFor="manualPlateNumber">
                                                Chasis <span className="text-red-500 ml-0.5">*</span>
                                            </Label>
                                            <FormControl>
                                                <Input
                                                    id="manualPlateNumber"
                                                    {...field}
                                                    ref={(e) => {
                                                        field.ref(e)
                                                        chasisInputRef.current = e
                                                    }}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
                                                        field.onChange(raw)
                                                    }}
                                                    className="h-11 font-mono font-black uppercase touch-manipulation text-base tracking-wider text-center
                                                        bg-black text-white border border-black
                                                        dark:bg-white dark:text-black dark:border-white
                                                        rounded-lg shadow-sm
                                                        placeholder:text-white/30 dark:placeholder:text-black/30
                                                        focus-visible:ring-primary/50"
                                                    maxLength={20}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    placeholder="ABC1234567"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="messengerId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <Label htmlFor="messengerId">
                                                Transportista <span className="text-red-500 ml-0.5">*</span>
                                            </Label>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                                name="messengerId"
                                            >
                                                <FormControl>
                                                    <SelectTrigger id="messengerId" className="h-11 touch-manipulation">
                                                        <SelectValue placeholder="Selecciona el transportista" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {messengers.map((messenger) => (
                                                        <SelectItem
                                                            key={messenger.idEmployee}
                                                            value={String(messenger.idEmployee)}
                                                        >
                                                            {messenger.fullName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="originDealershipId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <Label htmlFor="originDealershipId">
                                                Concesionario origen <span className="text-red-500 ml-0.5">*</span>
                                            </Label>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                                name="originDealershipId"
                                            >
                                                <FormControl>
                                                    <SelectTrigger id="originDealershipId" className="h-11 touch-manipulation">
                                                        <SelectValue placeholder="Selecciona origen" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {groupedDealerships.map(([zone, zoneDealerships]) => (
                                                        <SelectGroup key={zone}>
                                                            <SelectLabel className="text-xs font-semibold text-primary bg-muted/50 py-2 px-2">
                                                                {zone}
                                                            </SelectLabel>
                                                            {zoneDealerships.map((dealership) => (
                                                                <SelectItem
                                                                    key={dealership.idDealership}
                                                                    value={String(dealership.idDealership)}
                                                                    className="py-3 pl-4"
                                                                >
                                                                    {dealership.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dealershipId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <Label htmlFor="dealershipId">
                                                Concesionario destino <span className="text-red-500 ml-0.5">*</span>
                                            </Label>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                                name="dealershipId"
                                            >
                                                <FormControl>
                                                    <SelectTrigger id="dealershipId" className="h-11 touch-manipulation">
                                                        <SelectValue placeholder="Selecciona destino" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {groupedDealerships.map(([zone, zoneDealerships]) => (
                                                        <SelectGroup key={zone}>
                                                            <SelectLabel className="text-xs font-semibold text-primary bg-muted/50 py-2 px-2">
                                                                {zone}
                                                            </SelectLabel>
                                                            {zoneDealerships.map((dealership) => (
                                                                <SelectItem
                                                                    key={dealership.idDealership}
                                                                    value={String(dealership.idDealership)}
                                                                    className="py-3 pl-4"
                                                                >
                                                                    {dealership.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex gap-4 p-4 pt-4 mt-auto border-t bg-muted/5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/admin/servicios")}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || loadingData || !form.formState.isDirty}
                                size="sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear servicio"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </div>
        </Card>
        </>
    )
}
