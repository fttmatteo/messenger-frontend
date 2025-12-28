import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Home, Loader2, Save, UserPlus } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { useStatusColors } from "@/hooks/useStatusColors"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"

import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { useAuth } from "@/context/AuthContext"
import { getAvailableStatusesForUser, getStatusIconConfig } from "@/lib/status-utils"
import { getErrorMessage } from "@/lib/error-utils"

export default function UpdateServiceStatus() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { setSuccess, setError } = useAdminUI()
    const { colors } = useStatusColors()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [updating, setUpdating] = useState(false)

    // Reassign states (only for CANCELED services)
    const [showReassign, setShowReassign] = useState(false)
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<string>('')
    const [reassigning, setReassigning] = useState(false)





    useEffect(() => {
        const fetchService = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)

                // Initialize form with current data
                setNewStatus(data.currentStatus)
                setObservation('')

                // If service is CANCELED, fetch messengers for reassignment
                if (data.currentStatus === 'CANCELED' && user?.role === 'ADMIN') {
                    setShowReassign(true)
                    try {
                        const employees = await employeeService.getAll()
                        const messengersList = employees.filter(e => e.role === 'MESSENGER')
                        setMessengers(messengersList)
                    } catch {
                        // Ignore error, just won't show reassign option
                    }
                }

            } catch (error) {
                setError(getErrorMessage(error))
                navigate("/admin/servicios")
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id, navigate, setError, user?.role])



    // Handle update status submission
    const handleUpdateStatus = async () => {
        if (!service) return



        try {
            setUpdating(true)
            await serviceDeliveryService.updateStatus(service.idServiceDelivery, {
                status: newStatus,
                observation: observation || undefined,
            })

            setSuccess(`Estado de servicio ${service.plate.plateNumber} actualizado`)

            navigate("/admin/servicios")
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setUpdating(false)
        }
    }

    // Handle reassign messenger
    const handleReassign = async () => {
        if (!service || !selectedMessenger) return

        try {
            setReassigning(true)
            await serviceDeliveryService.reassign(
                service.idServiceDelivery,
                Number(selectedMessenger)
            )

            setSuccess(`Servicio ${service.plate.plateNumber} reasignado al mensajero`)

            navigate("/admin/servicios")
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setReassigning(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!service) return null

    return (
        <div className="space-y-1">
            {/* Breadcrumbs */}
            {/* Header with Navigation and Centered Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
                <div className="flex-1">
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
                                <BreadcrumbLink asChild>
                                    <Link to={`/admin/servicios/${id}`}>
                                        {service.plate.plateNumber}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Actualizar</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="md:flex-1 md:text-center text-xl md:text-2xl font-bold whitespace-nowrap">Actualizar estado</h1>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            {/* Reassign Alert - Integrated at top for CANCELED services */}
            {showReassign && messengers.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-4 mb-2">
                    <div className="flex items-start gap-3">
                        <UserPlus className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-base text-red-900 dark:text-red-100">Servicio cancelado - Reasignación disponible</p>
                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                Este servicio fue cancelado. Puedes reasignarlo a otro mensajero para reintentar la entrega.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={selectedMessenger} onValueChange={setSelectedMessenger}>
                            <SelectTrigger className="flex-1 bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Selecciona un mensajero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel className="text-muted-foreground">Mensajeros disponibles</SelectLabel>
                                    {messengers.map((messenger) => (
                                        <SelectItem
                                            key={messenger.idEmployee}
                                            value={String(messenger.idEmployee)}
                                        >
                                            {messenger.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleReassign}
                            disabled={!selectedMessenger || reassigning}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {reassigning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Reasignando...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Reasignar servicio
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <Card className="gap-1 py-1">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="lg"
                        />
                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Estado:</span>
                            {(() => {
                                const role = user?.role as 'ADMIN' | 'MESSENGER' | undefined
                                const availableStatuses = role
                                    ? getAvailableStatusesForUser(role)
                                    : []

                                if (availableStatuses.length === 0) {
                                    return (
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                                            <span className="font-medium text-sm">
                                                {getStatusIconConfig(service.currentStatus, colors).label}
                                            </span>
                                        </div>
                                    )
                                }

                                return (
                                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Selecciona un nuevo estado">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(newStatus, colors).dotStyle} />
                                                    <span>{getStatusIconConfig(newStatus, colors).label}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel className="text-muted-foreground">Selecciona un nuevo estado</SelectLabel>
                                                {availableStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(status.value, colors).dotStyle} />
                                                            <span>{status.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )
                            })()}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">



                    {/* Observation */}
                    <div className="space-y-2">
                        <Label htmlFor="observation">Observaciones</Label>
                        <Textarea
                            id="observation"
                            placeholder="Agrega observaciones sobre el cambio de estado..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>



                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                            disabled={updating}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Actualizar estado
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
