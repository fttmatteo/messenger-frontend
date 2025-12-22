import { Moon, Sun, Laptop } from "lucide-react"
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
            <Sun className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all",
                theme === 'system' ? "scale-0 opacity-0" : "rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
            )} />
            <Moon className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all",
                theme === 'system' ? "scale-0 opacity-0" : "rotate-90 scale-0 dark:rotate-0 dark:scale-100"
            )} />

            {/* System Mode Icon - Only visible when theme is 'system' */}
            <Laptop className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all",
                theme === 'system' ? "scale-100 rotate-0" : "scale-0 rotate-90"
            )} />
        </Button>
    )
}
