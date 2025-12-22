import { useMessengerServices } from "@/hooks/useMessengerServices"
import { StatsBar } from "@/components/messenger/StatsBar"
import { ServiceList } from "@/components/messenger/ServiceList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function MessengerDashboard() {
    const {
        loading,
        pendingServices,
        completedServices,
        stats,
        refetch,
        error
    } = useMessengerServices()

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Handle refresh
    const handleRefresh = async () => {
        if (!isOnline) return
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }

    // Get current date
    const today = new Date()
    const dateString = today.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    // Get greeting based on time
    const getGreeting = () => {
        const hour = today.getHours()
        if (hour < 12) return '¡Buenos días'
        if (hour < 18) return '¡Buenas tardes'
        return '¡Buenas noches'
    }

    // Get first name from user (using document as fallback since fullName isn't stored in auth)
    const userName = 'Mensajero'

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            {/* Offline Banner */}
            {!isOnline && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                    <WifiOff className="h-4 w-4 flex-shrink-0" />
                    <span>Sin conexión - Mostrando datos guardados</span>
                </div>
            )}

            {/* Header with Welcome Message */}
            <header className="flex items-start justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold leading-tight">
                        {getGreeting()}, {userName}!
                    </h1>
                    <p className="text-sm text-muted-foreground capitalize">
                        {dateString}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing || !isOnline}
                    className="h-9 w-9"
                >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </header>

            {/* Stats Bar */}
            <StatsBar stats={stats} loading={loading} />

            {/* Services Tabs */}
            <Tabs defaultValue="pending" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="pending" className="text-sm">
                        Pendientes ({pendingServices.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-sm">
                        Completados ({completedServices.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="flex-1 overflow-auto mt-4">
                    <ServiceList
                        services={pendingServices}
                        loading={loading}
                        emptyMessage="No tienes servicios pendientes 🎉"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="completed" className="flex-1 overflow-auto mt-4">
                    <ServiceList
                        services={completedServices}
                        loading={loading}
                        emptyMessage="Aún no has completado servicios hoy"
                        onRefresh={handleRefresh}
                    />
                </TabsContent>
            </Tabs>

            {/* Error State */}
            {error && !loading && (
                <div className="fixed bottom-20 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
