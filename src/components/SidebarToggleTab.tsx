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
                isCollapsed ? "left-0" : "left-[var(--sidebar-width)]"
            )}
        >
            <Button
                variant="ghost"
                onClick={toggleSidebar}
                className={cn(
                    "h-96 w-1 hover:w-8 rounded-r-3xl rounded-l-none border border-l-0 bg-sidebar shadow-lg group p-0 min-w-0 flex items-center justify-center transition-all duration-500 ease-in-out overflow-hidden border-sidebar-border/50",
                    "hover:bg-sidebar hover:text-sidebar-foreground", // Force same color on hover
                    "opacity-100"
                )}
                title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            >
                <div className={cn(
                    "flex items-center justify-center transition-all duration-300 transform",
                    "opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0"
                )}>
                    {isCollapsed ? (
                        <ChevronRight className="h-6 w-6 text-sidebar-foreground" />
                    ) : (
                        <ChevronLeft className="h-6 w-6 text-sidebar-foreground" />
                    )}
                </div>
            </Button>
        </div>
    )
}
