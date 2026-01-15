import { useSidebar } from "@/components/ui/sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
                    "h-7 w-7 rounded-full !bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-md",
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
