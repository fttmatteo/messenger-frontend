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
                <div
                    className={cn(
                        "absolute bg-border",
                        layout === "vertical"
                            ? (centered
                                ? "left-1/2 -ml-px top-8 bottom-0 w-px" // Centered vertical line
                                : "left-[19px] top-8 bottom-0 w-px") // Standard sidebar line
                            : "top-[19px] left-[50%] right-[-50%] h-px" // Horizontal line
                    )}
                    aria-hidden="true"
                />
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
                // Layout specific spacing
                layout === "vertical"
                    ? (centered ? "mt-4 w-full" : "ml-14 -mt-8")
                    : "mt-4 w-full px-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
