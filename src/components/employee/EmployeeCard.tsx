import { motion } from "framer-motion"
import {
    FileText,
    PhoneCall,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react"

// Components
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Types
import type { Employee } from "@/types/employee.types"

interface EmployeeCardProps {
    employee: Employee
    onEdit: (employeeId: number) => void
    onDelete: (employeeId: number) => void
    deleting: number | null
}

/**
 * Returns text color class based on employee role
 */
function getRoleTextClass(role: string): string {
    return role === 'ADMIN'
        ? "text-purple-600 dark:text-purple-400"
        : "text-blue-600 dark:text-blue-400"
}

/**
 * Formats a full name to show first name and initial of last name
 * Example: "Juan Carlos Perez" → "Juan P."
 */
function formatDisplayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
}

/**
 * Mobile card component for displaying an employee in list view.
 * Shows name, role, username, document, and phone with action buttons.
 */
export function EmployeeCard({ employee, onEdit, onDelete, deleting }: EmployeeCardProps) {
    return (
        <motion.div exit="exit" layout>
            <Card className="mb-3 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="space-y-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <h3 className="font-semibold text-lg truncate cursor-default">{formatDisplayName(employee.fullName)}</h3>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{employee.fullName}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <span className={`text-base font-semibold ${getRoleTextClass(employee.role)}`}>
                                    {employee.role === 'ADMIN' ? 'Administrador' : 'Mensajero'}
                                </span>
                            </div>
                            <div className="space-y-1 text-base text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="font-mono">{employee.document}</span>
                                </div>
                                <div className="flex items-center">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={`tel:${employee.phone}`}
                                                className="hover:underline hover:text-primary transition-colors flex items-center gap-2"
                                            >
                                                <PhoneCall className="h-3.5 w-3.5" />
                                                {employee.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => onEdit(employee.idEmployee)}
                                className="bg-primary hover:bg-primary/90"
                                aria-label="Editar empleado"
                            >
                                <Pencil className="h-5 w-5" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                        aria-label="Eliminar empleado"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Eliminar empleado?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{employee.fullName}</strong> del sistema.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onDelete(employee.idEmployee)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            disabled={deleting === employee.idEmployee}
                                        >
                                            {deleting === employee.idEmployee ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
