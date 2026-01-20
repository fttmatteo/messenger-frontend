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
        <div className={cn("relative pl-6 pb-4 last:pb-0 group/timeline-item", className)} {...props}>
            {!isLast && (
                <div
                    className="absolute left-[7px] top-[22px] bottom-[-4px] w-[2px] bg-border group-data-[small=true]/timeline-item:left-[5px] group-data-[small=true]/timeline-item:top-[18px]"
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
    statusStyle?: React.CSSProperties
    size?: 'default' | 'sm'
}

export function TimelineHeader({ className, children, icon, statusColor, statusStyle, size = 'default', ...props }: TimelineHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-1 mb-1", className)} {...props}>
            <div
                className={cn(
                    "absolute left-0 top-1.5 flex items-center justify-center rounded-full",
                    size === 'default' ? "h-4 w-4" : "h-3 w-3 top-1",
                    statusColor
                )}
                style={statusStyle}
            >
                {icon}
            </div>
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
