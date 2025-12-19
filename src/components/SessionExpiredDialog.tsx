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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <LogOut className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
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
