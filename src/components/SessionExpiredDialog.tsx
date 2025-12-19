import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LogOut } from 'lucide-react'

export function SessionExpiredDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleSessionExpired = () => {
            setIsOpen(true)
        }

        window.addEventListener('session-expired', handleSessionExpired)

        return () => {
            window.removeEventListener('session-expired', handleSessionExpired)
        }
    }, [])

    const handleRedirectToLogin = () => {
        setIsOpen(false)
        navigate('/login', { replace: true })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <LogOut className="h-6 w-6 text-red-500" />
                        <AlertDialogTitle className="text-xl">
                            ¡Sesión Expirada!
                        </AlertDialogTitle>
                    </div>
                </AlertDialogHeader>
                <AlertDialogDescription className="text-base">
                    Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleRedirectToLogin} className="w-full sm:w-auto">
                        Ir al inicio de sesión
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
