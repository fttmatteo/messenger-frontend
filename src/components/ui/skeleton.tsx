import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** This property is kept for backward compatibility but animations are fully disabled */
  static?: boolean
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
