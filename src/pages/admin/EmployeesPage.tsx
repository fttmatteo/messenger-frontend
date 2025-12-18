import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { EmployeeList } from '@/components/EmployeeList'
import { EmployeeForm } from '@/components/EmployeeForm'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Employee } from '@/types'

export function EmployeesPage() {
    const [showModal, setShowModal] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

    const handleCreate = () => {
        setEditingEmployee(null)
        setShowModal(true)
    }

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee)
        setShowModal(true)
    }

    const handleClose = () => {
        setShowModal(false)
        setEditingEmployee(null)
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gestión de Empleados</h1>
            </div>

            <EmployeeList onCreate={handleCreate} onEdit={handleEdit} />

            {/* Modal para crear/editar */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
                    <div className="relative z-10 w-full max-w-lg">
                        <button
                            onClick={handleClose}
                            className="absolute -top-3 -right-3 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <EmployeeForm
                            employee={editingEmployee}
                            onSuccess={handleClose}
                            onCancel={handleClose}
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
