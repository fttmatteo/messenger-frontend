import { cn } from '@/lib/utils'
import { Bike } from 'lucide-react'

interface PlacaBadgeProps {
    plateNumber: string
    plateType?: 'MOTO' | 'CARRO' | string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function PlacaBadge({
    plateNumber,
    plateType = 'CARRO',
    size = 'md',
    className
}: PlacaBadgeProps) {
    const formatPlate = (plate: string) => {
        const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (clean.length === 6) {
            return { letters: clean.slice(0, 3), numbers: clean.slice(3, 6) }
        }
        return { letters: clean, numbers: '' }
    }

    const { letters, numbers } = formatPlate(plateNumber)

    const sizeClasses = {
        sm: 'text-sm px-2 py-0.5 rounded',
        md: 'text-base px-3 py-1 rounded-md',
        lg: 'text-xl px-4 py-2 rounded-lg',
        xl: 'text-2xl px-5 py-2.5 rounded-lg',
    }

    const isMoto = plateType?.toUpperCase() === 'MOTO'

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold tracking-wider border-2 border-black shadow-sm",
                "dark:border-white dark:ring-2 dark:ring-inset dark:ring-black",
                "bg-yellow-400 dark:bg-yellow-500 text-black dark:text-white",
                sizeClasses[size],
                className
            )}
            title={`Placa ${plateNumber} - ${plateType}`}
        >
            <span className="font-mono font-black dark:[text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
                {letters}
            </span>
            {numbers && (
                <>
                    <span className="mx-0.5 text-gray-700 dark:text-white dark:[text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">•</span>
                    <span className="font-mono font-black dark:[text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
                        {numbers}
                    </span>
                </>
            )}
            {isMoto && (
                <span className="ml-1 bg-black text-yellow-400 p-0.5 rounded">
                    <Bike className="h-3 w-3" />
                </span>
            )}
        </span>
    )
}

