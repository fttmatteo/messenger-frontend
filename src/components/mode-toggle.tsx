import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModeToggleProps {
    className?: string
}

export function ModeToggle({ className }: ModeToggleProps) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={cn("rounded-full relative", className)}
            title={`Tema actual: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}`}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>

            {/* Small indicator dot for system theme */}
            {theme === 'system' && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border border-background" />
            )}
        </Button>
    )
}
