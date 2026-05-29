import { useSidebar } from "@/shared/components/ui/sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"

/**
 * Pestaña flotante lateral que permite expandir o contraer la barra lateral de navegación.
 * Automatiza la visibilidad según el estado del dispositivo (solo escritorio).
 */
export function SidebarToggleTab() {
    const { toggleSidebar, state, isMobile } = useSidebar()

    if (isMobile) return null

    const isCollapsed = state === "collapsed"

    return (
        <div
            className={cn(
                "fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out",
                isCollapsed ? "left-[-14px]" : "left-[calc(var(--sidebar-width)-14px)]"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                    "!h-[32px] !w-[32px] !min-h-[32px] !max-h-[32px] box-border rounded-full !bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-md m-0",
                    "hover:!bg-sidebar hover:text-primary hover:!border-sidebar-border",
                    "transition-all duration-200 opacity-100 flex items-center justify-center",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                    "group p-0"
                )}
                title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:scale-110" />
                ) : (
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
            </Button>
        </div>
    )
}
