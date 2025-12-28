import React from "react"
import { cn } from "@/lib/utils"

type TimelineProps = React.HTMLAttributes<HTMLDivElement>

export function Timeline({ className, children, ...props }: TimelineProps) {
    return (
        <div className={cn("space-y-0", className)} {...props}>
            {children}
        </div>
    )
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
    isLast?: boolean
}

export function TimelineItem({ className, children, isLast, ...props }: TimelineItemProps) {
    return (
        <div className={cn("relative pl-8 pb-8 last:pb-0", className)} {...props}>
            {/* Connecting Line */}
            {!isLast && (
                <div
                    className="absolute left-[11px] top-[28px] bottom-[-4px] w-[2px] bg-black dark:bg-white"
                    aria-hidden="true"
                />
            )}
            {children}
        </div>
    )
}

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode
    statusColor?: string
}

export function TimelineHeader({ className, children, icon, statusColor, ...props }: TimelineHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-2 mb-2", className)} {...props}>
            {/* Status Icon/Dot */}
            <div
                className={cn(
                    "absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background",
                    statusColor
                )}
            >
                {icon}
            </div>
            {/* Header Content (Status Badge, etc) */}
            <div className="flex items-center">
                {children}
            </div>
        </div>
    )
}

type TimelineContentProps = React.HTMLAttributes<HTMLDivElement>

export function TimelineContent({ className, children, ...props }: TimelineContentProps) {
    return (
        <div className={cn("mt-1", className)} {...props}>
            {children}
        </div>
    )
}
