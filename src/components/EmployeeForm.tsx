/**
 * EmployeeForm - Formulario de Empleados
 * 
 * Formulario para crear y editar empleados.
 * Usa React Query mutations para guardar.
 */

import { useState, FormEvent, useEffect } from 'react'
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployeeMutations'
import { Employee, CreateEmployeeRequest, EmployeeRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2, Save, X } from 'lucide-react'

/**
 * Props del formulario
 */
interface EmployeeFormProps {
    /** Empleado a editar (null para crear nuevo) */
    employee?: Employee | null
    /** Callback al guardar exitosamente */
    onSuccess?: () => void
    /** Callback al cancelar */
    onCancel?: () => void
}

/**
 * Estado inicial del formulario
 */
const initialFormState: CreateEmployeeRequest = {
    document: '',
    fullName: '',
    phone: '',
    userName: '',
    password: '',
    role: 'MESSENGER',
}

/**
 * EmployeeForm Component
 */
export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
    const [formData, setFormData] = useState<CreateEmployeeRequest>(initialFormState)
    const [errors, setErrors] = useState<Partial<Record<keyof CreateEmployeeRequest, string>>>({})

    const { mutate: createEmployee, isPending: isCreating, error: createError } = useCreateEmployee()
    const { mutate: updateEmployee, isPending: isUpdating, error: updateError } = useUpdateEmployee()

    const isEditing = !!employee
    const isPending = isCreating || isUpdating
    const mutationError = createError || updateError

    // Cargar datos del empleado si estamos editando
    useEffect(() => {
        if (employee) {
            setFormData({
                document: employee.document,
                fullName: employee.fullName,
                phone: employee.phone,
                userName: employee.userName,
                password: '', // No mostramos la contraseña actual
                role: employee.role,
            })
        } else {
            setFormData(initialFormState)
        }
    }, [employee])

    // Validar formulario
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateEmployeeRequest, string>> = {}

        if (!formData.document.trim()) {
            newErrors.document = 'El documento es requerido'
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre es requerido'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido'
        }
        if (!formData.userName.trim()) {
            newErrors.userName = 'El usuario es requerido'
        }
        if (!isEditing && !formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Manejar cambios en inputs
    const handleChange = (field: keyof CreateEmployeeRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    // Manejar envío
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        if (isEditing && employee) {
            updateEmployee(
                {
                    id: employee.id,
                    data: {
                        ...formData,
                        password: formData.password || undefined, // Omitir si está vacío
                    }
                },
                { onSuccess }
            )
        } else {
            createEmployee(formData, { onSuccess })
        }
    }

    return (
        <Card className="w-full max-w-lg border-slate-700 bg-slate-800">
            <CardHeader>
                <CardTitle className="text-white">
                    {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
                </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Error de mutación */}
                    {mutationError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {mutationError.message}
                        </div>
                    )}

                    {/* Documento */}
                    <div className="space-y-2">
                        <Label htmlFor="document" className="text-slate-300">
                            Documento *
                        </Label>
                        <Input
                            id="document"
                            value={formData.document}
                            onChange={(e) => handleChange('document', e.target.value)}
                            placeholder="Número de documento"
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            disabled={isPending}
                        />
                        {errors.document && (
                            <p className="text-red-400 text-xs">{errors.document}</p>
                        )}
                    </div>

                    {/* Nombre completo */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-300">
                            Nombre Completo *
                        </Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            placeholder="Nombre y apellidos"
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            disabled={isPending}
                        />
                        {errors.fullName && (
                            <p className="text-red-400 text-xs">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">
                            Teléfono *
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="Número de teléfono"
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            disabled={isPending}
                        />
                        {errors.phone && (
                            <p className="text-red-400 text-xs">{errors.phone}</p>
                        )}
                    </div>

                    {/* Usuario */}
                    <div className="space-y-2">
                        <Label htmlFor="userName" className="text-slate-300">
                            Nombre de Usuario *
                        </Label>
                        <Input
                            id="userName"
                            value={formData.userName}
                            onChange={(e) => handleChange('userName', e.target.value)}
                            placeholder="Usuario para login"
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            disabled={isPending}
                        />
                        {errors.userName && (
                            <p className="text-red-400 text-xs">{errors.userName}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">
                            Contraseña {isEditing ? '(dejar vacío para mantener)' : '*'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder={isEditing ? '••••••••' : 'Contraseña'}
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            disabled={isPending}
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs">{errors.password}</p>
                        )}
                    </div>

                    {/* Rol */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Rol *</Label>
                        <div className="flex gap-4">
                            {(['MESSENGER', 'ADMIN'] as EmployeeRole[]).map((role) => (
                                <label
                                    key={role}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${formData.role === role
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={formData.role === role}
                                        onChange={(e) => handleChange('role', e.target.value as EmployeeRole)}
                                        className="sr-only"
                                        disabled={isPending}
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex gap-3 justify-end border-t border-slate-700 pt-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isPending}
                            className="text-slate-400"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
