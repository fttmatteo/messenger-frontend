import { cn } from '@/lib/utils'

interface PlacaBadgeProps {
    plateNumber: string
    plateType?: 'MOTO' | 'CARRO' | string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function PlacaBadge({
    plateNumber,
    plateType = 'CARRO',
    size = 'md',
    className
}: PlacaBadgeProps) {
    // Split plate number for formatting (e.g., "IVC86G" -> "IVC" + "86G")
    const formatPlate = (plate: string) => {
        const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (clean.length === 6) {
            // Format: ABC 123 or ABC 12D
            return { letters: clean.slice(0, 3), numbers: clean.slice(3, 6) }
        }
        return { letters: clean, numbers: '' }
    }

    const { letters, numbers } = formatPlate(plateNumber)

    const sizeClasses = {
        sm: 'text-sm px-2 py-0.5 rounded',
        md: 'text-base px-3 py-1 rounded-md',
        lg: 'text-xl px-4 py-2 rounded-lg',
    }

    const isMoto = plateType?.toUpperCase() === 'MOTO'

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold tracking-wider border-2 border-black dark:border-white shadow-sm",
                // Colombian plate colors: yellow background, black text
                "bg-yellow-400 text-black",
                sizeClasses[size],
                className
            )}
            title={`Placa ${plateNumber} - ${plateType}`}
        >
            <span className="font-mono font-black">
                {letters}
            </span>
            {numbers && (
                <>
                    <span className="mx-0.5 text-gray-700">•</span>
                    <span className="font-mono font-black">
                        {numbers}
                    </span>
                </>
            )}
            {isMoto && (
                <span className="ml-1 text-[0.6em] bg-black text-yellow-400 px-1 rounded text-xs">
                    🏍️
                </span>
            )}
        </span>
    )
}
