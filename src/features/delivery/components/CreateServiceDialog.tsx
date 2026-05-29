import { useState, useEffect, useMemo, useRef } from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { serviceDeliveryService } from "@/features/delivery/services/service.service"
import { dealershipService } from "@/features/dealership/services/dealership.service"
import { employeeService } from "@/features/employee/services/employee.service"
import type { Dealership } from "@/features/dealership/types/dealership.types"
import type { Employee } from "@/features/employee/types/employee.types"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { useSmartLocation } from "@/features/tracking/hooks/use-smart-location"


const baseSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario destino es obligatorio"),
    originDealershipId: z.string().min(1, "El concesionario origen es obligatorio"),
    messengerId: z.string().min(1, "El mensajero es obligatorio"),
    manualPlateNumber: z.string().min(10, "El chasis debe tener mínimo 10 caracteres").max(20, "El chasis no puede tener más de 20 caracteres"),
    isScheduled: z.boolean().default(false),
    scheduledAt: z.string().optional(),
})

const formSchema = baseSchema.refine((data) => data.originDealershipId !== data.dealershipId, {
    message: "El concesionario origen y destino no pueden ser el mismo",
    path: ["originDealershipId"],
}).refine((data) => {
    if (data.isScheduled) {
        if (!data.scheduledAt) return false;
        const scheduledTime = new Date(data.scheduledAt).getTime();
        const now = new Date().getTime();
        return scheduledTime > now + 60000;
    }
    return true;
}, {
    message: "La fecha y hora de programación debe ser en el futuro",
    path: ["scheduledAt"],
})

type FormValues = z.infer<typeof baseSchema>

export interface CreateServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateServiceDialog({ open, onOpenChange, onSuccess }: CreateServiceDialogProps) {
    const { setSuccess, setError } = useAdminUI()
    const chasisInputRef = useRef<HTMLInputElement>(null)
    const { getCurrentLocation } = useSmartLocation()

    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [loadingData, setLoadingData] = useState(true)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            dealershipId: "",
            originDealershipId: "",
            messengerId: "",
            manualPlateNumber: "",
            isScheduled: false,
            scheduledAt: "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                dealershipId: "",
                originDealershipId: "",
                messengerId: "",
                manualPlateNumber: "",
                isScheduled: false,
                scheduledAt: "",
            })
        }
    }, [open, form])

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

            let formattedScheduledAt: string | undefined
            if (values.isScheduled && values.scheduledAt) {
                formattedScheduledAt = new Date(values.scheduledAt).toISOString()
            }

            await serviceDeliveryService.create({
                dealershipId: values.dealershipId,
                originDealershipId: values.originDealershipId,
                messengerDocument: values.messengerId,
                manualPlateNumber: values.manualPlateNumber,
                latitude,
                longitude,
                scheduledAt: formattedScheduledAt
            })

            setSuccess(values.isScheduled ? "Servicio programado exitosamente" : "Servicio creado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold">Nuevo servicio</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Ingresa los detalles para crear un nuevo servicio de entrega
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
                                                    <SelectTrigger id="messengerId" className="w-full h-11 touch-manipulation">
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
                                                    <SelectTrigger id="originDealershipId" className="w-full h-11 touch-manipulation">
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
                                                    <SelectTrigger id="dealershipId" className="w-full h-11 touch-manipulation">
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

                                <FormField
                                    control={form.control}
                                    name="isScheduled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5 pr-4">
                                                <Label htmlFor="isScheduled" className="text-sm font-semibold">¿Programar servicio?</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    El servicio se creará en estado programado y se activará automáticamente a la fecha y hora seleccionada.
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    id="isScheduled"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("isScheduled") && (
                                    <FormField
                                        control={form.control}
                                        name="scheduledAt"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <Label htmlFor="scheduledAt">
                                                    Fecha y hora de activación <span className="text-red-500 ml-0.5">*</span>
                                                </Label>
                                                <FormControl>
                                                    <Input
                                                        id="scheduledAt"
                                                        type="datetime-local"
                                                        className="h-11"
                                                        {...field}
                                                        min={(() => {
                                                            const d = new Date(Date.now() + 60000);
                                                            const tzOffset = d.getTimezoneOffset() * 60000;
                                                            return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
                                                        })()}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 sm:justify-end bg-muted/5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || loadingData || !form.formState.isDirty}
                                size="sm"
                                className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
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
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
