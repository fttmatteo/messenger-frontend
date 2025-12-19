import React from "react"
import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

// Context to share layout orientation
interface TimelineContextValue {
    layout: "vertical" | "horizontal"
    centered?: boolean
}
const TimelineContext = React.createContext<TimelineContextValue>({ layout: "vertical", centered: false })

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
    layout?: "vertical" | "horizontal"
    centered?: boolean // Useful for vertical layouts to center items
}

export function Timeline({ layout = "vertical", centered = false, className, children, ...props }: TimelineProps) {
    return (
        <TimelineContext.Provider value={{ layout, centered }}>
            <div
                className={cn(
                    "flex",
                    layout === "vertical" ? "flex-col" : "flex-row",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </TimelineContext.Provider>
    )
}

interface TimelineItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode
    isLast?: boolean
}

export function TimelineItem({ className, children, isLast, ...props }: TimelineItemProps) {
    const { layout, centered } = React.useContext(TimelineContext)

    return (
        <motion.div
            className={cn(
                "relative flex",
                // Layout specific styles
                layout === "vertical"
                    ? (centered ? "flex-col items-center pb-8 last:pb-0" : "flex-col pb-8 last:pb-0")
                    : "flex-col items-center flex-1",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {/* Connector Line */}
            {!isLast && (
                <>
                    {/* Standard Line (Sidebar or Horizontal) */}
                    {(!centered || layout === "horizontal") && (
                        <div
                            className={cn(
                                "absolute bg-border",
                                layout === "vertical"
                                    ? "left-[19px] top-8 bottom-0 w-1" // Standard sidebar line
                                    : "top-[19px] left-[50%] right-[-50%] h-1" // Horizontal line
                            )}
                            aria-hidden="true"
                        />
                    )}

                    {/* Centered Mobile Bottom Connector (Box to Next Badge) */}
                    {(centered && layout === "vertical") && (
                        <div
                            className="absolute bottom-0 left-1/2 -ml-0.5 w-1 h-8 bg-gradient-to-b from-primary/20 to-primary/60"
                            aria-hidden="true"
                        />
                    )}
                </>
            )}
            {children}
        </motion.div>
    )
}

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function TimelineHeader({ className, children, ...props }: TimelineHeaderProps) {
    const { layout } = React.useContext(TimelineContext)

    return (
        <div
            className={cn(
                "flex items-center gap-4 z-10",
                layout === "vertical" ? "flex-row" : "flex-col",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function TimelineContent({ className, children, ...props }: TimelineContentProps) {
    const { layout, centered } = React.useContext(TimelineContext)

    return (
        <div
            className={cn(
                "relative",
                // Layout specific spacing
                layout === "vertical"
                    ? (centered ? "mt-4 w-full border-2 border-primary/40 rounded-xl bg-card/50" : "ml-14 -mt-8")
                    : "mt-4 w-full px-2",
                className
            )}
            {...props}
        >
            {/* Visual connection between Header (Badge) and Content (Card) */}
            {(layout === "horizontal" || (layout === "vertical" && centered)) && (
                <div
                    className="absolute -top-4 left-1/2 -ml-0.5 w-1 h-4 bg-gradient-to-b from-primary/60 to-primary/40"
                    aria-hidden="true"
                />
            )}
            {children}
        </div>
    )
}
