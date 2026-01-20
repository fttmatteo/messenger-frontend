import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModeToggleProps {
    className?: string
    showLabel?: boolean
}

/**
 * Botón para alternar entre los temas visuales del sistema (claro, oscuro, sistema).
 * Incluye iconos animados y etiquetas descriptivas opcionales.
 */
export function ModeToggle({ className, showLabel = true }: ModeToggleProps) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    return (
        <Button
            variant="ghost"
            size={showLabel ? "sm" : "icon"}
            onClick={toggleTheme}
            className={cn(
                "flex items-center hover:bg-muted transition-colors rounded-lg",
                showLabel ? "h-9 px-3 gap-2" : "",
                className
            )}
            title={`Tema actual: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}`}
        >
            <div className="relative h-4 w-4 flex items-center justify-center">
                <Sun className={cn(
                    "h-4 w-4 transition-all",
                    theme === 'system' ? "scale-0 opacity-0" : "rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
                )} />
                <Moon className={cn(
                    "absolute h-4 w-4 transition-all",
                    theme === 'system' ? "scale-0 opacity-0" : "rotate-90 scale-0 dark:rotate-0 dark:scale-100"
                )} />
                <Laptop className={cn(
                    "absolute h-4 w-4 transition-all",
                    theme === 'system' ? "scale-100 rotate-0" : "scale-0 rotate-90"
                )} />
            </div>
            {showLabel && <span className="text-xs font-medium text-muted-foreground">Tema</span>}
        </Button>
    )
}
