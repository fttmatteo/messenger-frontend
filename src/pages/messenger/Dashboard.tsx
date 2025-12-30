import { useMessengerServices } from "@/hooks/useMessengerServices"
import { usePullToRefresh } from "@/hooks/usePullToRefresh"
import { useNetwork } from "@/hooks/useNetwork"
import { ServiceList } from "@/components/messenger/ServiceList"
import { PullIndicator } from "@/components/messenger/PullIndicator"
import { RefreshCw, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function MessengerDashboard() {
    const { loading, pendingServices, refetch, error, isFromCache } = useMessengerServices()
    const { isOnline } = useNetwork()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { containerRef, isRefreshing: isPulling, pullDistance } = usePullToRefresh({
        onRefresh: refetch,
        disabled: !isOnline
    })

    const handleRefresh = async () => {
        if (!isOnline || isRefreshing) return
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }

    const today = new Date()
    const dateString = today.toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    })

    const getGreeting = () => {
        const hour = today.getHours()
        if (hour < 12) return 'Buenos días'
        if (hour < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full overflow-hidden"
        >
            {/* Pull to refresh indicator */}
            <PullIndicator
                pullDistance={pullDistance}
                isRefreshing={isPulling}
            />

            <div className="flex flex-col h-full p-3 gap-3 overflow-auto">
                {/* Compact Header with Greeting */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            {getGreeting()} · <span className="capitalize">{dateString}</span>
                        </span>
                        {/* Subtle cache indicator */}
                        {isFromCache && !loading && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                                <Database className="h-2.5 w-2.5" />
                                cache
                            </span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing || isPulling || !isOnline}
                        className="h-8 w-8"
                    >
                        <RefreshCw className={`h-4 w-4 ${(isRefreshing || isPulling) ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Assigned Services Title */}
                <p className="text-xs text-muted-foreground">
                    {pendingServices.length} servicio{pendingServices.length !== 1 ? 's' : ''} creados{pendingServices.length !== 1 ? 's' : ''}
                </p>

                {/* Assigned Services List */}
                <div className="flex-1 overflow-auto">
                    <ServiceList
                        services={pendingServices}
                        loading={loading}
                        emptyMessage="No tienes servicios creados"
                    />
                </div>

                {/* Error State */}
                {error && !loading && (
                    <div className="fixed bottom-24 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg z-40">
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

