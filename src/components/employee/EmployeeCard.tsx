import { motion } from "framer-motion"
import {
    User,
    FileText,
    PhoneCall,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react"

// Components
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
 * Returns badge class based on employee role
 */
function getRoleBadgeClass(role: string): string {
    return role === 'ADMIN'
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
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
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{employee.fullName}</h3>
                                <Badge className={getRoleBadgeClass(employee.role) + " text-base px-3"}>
                                    {employee.role === 'ADMIN' ? 'Admin' : 'Mensajero'}
                                </Badge>
                            </div>
                            <div className="space-y-1 text-base text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    <span>@{employee.userName}</span>
                                </div>
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
