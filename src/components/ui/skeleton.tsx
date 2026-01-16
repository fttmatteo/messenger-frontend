import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** When true, disables the pulse animation */
  static?: boolean
}

function Skeleton({ className, static: isStatic, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md",
        !isStatic && "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
