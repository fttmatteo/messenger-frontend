import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LogOut } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function SessionExpiredDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    const isMobile = useIsMobile()

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
            <AlertDialogContent
                className={cn(
                    isMobile && "max-w-[90vw] rounded-xl bg-background/80 backdrop-blur-md"
                )}
            >
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <LogOut className="h-6 w-6 text-red-500" />
                        <AlertDialogTitle className="text-xl">
                            ¡Sesión Expirada!
                        </AlertDialogTitle>
                    </div>
                </AlertDialogHeader>
                <AlertDialogDescription className="text-base text-muted-foreground">
                    Tu sesión ha expirado, inicia sesión nuevamente para continuar.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={handleRedirectToLogin}
                        className={cn(
                            "w-full sm:w-auto font-medium transition-all duration-200",
                            isMobile
                                ? "text-red-500 border border-red-200 bg-transparent hover:bg-red-50 hover:text-red-600"
                                : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                        )}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
