import { RefreshCw } from "lucide-react"

interface PullIndicatorProps {
    pullDistance: number
    isRefreshing: boolean
    threshold?: number
}

export function PullIndicator({ pullDistance, isRefreshing, threshold = 80 }: PullIndicatorProps) {
    const progress = Math.min(pullDistance / threshold, 1)

    if (pullDistance === 0 && !isRefreshing) return null

    return (
        <div
            className="flex items-center justify-center py-2 transition-all overflow-hidden"
            style={{
                height: isRefreshing ? 40 : pullDistance,
                opacity: Math.min(progress * 2, 1)
            }}
        >
            <div
                className="flex items-center gap-2 text-muted-foreground"
                style={{
                    transform: `rotate(${progress * 180}deg)`,
                    transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
                }}
            >
                <RefreshCw
                    className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
            </div>
            {isRefreshing && (
                <span className="text-xs text-muted-foreground ml-2">Actualizando...</span>
            )}
        </div>
    )
}
