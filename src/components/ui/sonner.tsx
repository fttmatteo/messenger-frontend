import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset={isMobile ? 80 : 32}
      gap={12}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast !bg-background/95 !backdrop-blur-xl !border-border/50",
            "!shadow-lg !rounded-xl !p-4 !gap-3 !border-l-4",
            "!flex !items-center !justify-between !leading-relaxed"
          ),
          title: "!font-semibold !text-sm !text-foreground !flex-1",
          description: "!text-muted-foreground !text-xs !mt-0.5 !flex-1",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !px-3 sm:!px-4 !py-2 !h-auto !text-xs sm:!text-sm !font-medium !ml-2 !flex-shrink-0 hover:!opacity-90 transition-opacity",
          cancelButton: "!bg-muted hover:!bg-muted/80 !text-muted-foreground !rounded-lg !px-3 sm:!px-4 !py-2 !h-auto !text-xs sm:!text-sm !font-medium !flex-shrink-0 transition-colors",
          error: "!border-l-red-500/80 !bg-red-50/50 dark:!bg-red-950/20",
          success: "!border-l-green-500/80 !bg-green-50/50 dark:!bg-green-950/20",
          info: "!border-l-blue-500/80 !bg-blue-50/50 dark:!bg-blue-950/20",
          warning: "!border-l-amber-500/80 !bg-amber-50/50 dark:!bg-amber-950/20",
          loading: "!border-l-primary/80 !bg-primary/5",
        },
        style: {
          fontFamily: "inherit",
          wordBreak: "break-word",
        }
      }}
      icons={{
        success: <CircleCheckIcon className="!size-5 !text-green-500 !flex-shrink-0" />,
        info: <InfoIcon className="!size-5 !text-blue-500 !flex-shrink-0" />,
        warning: <TriangleAlertIcon className="!size-5 !text-amber-500 !flex-shrink-0" />,
        error: <TriangleAlertIcon className="!size-5 !text-red-500 !flex-shrink-0" />,
        loading: <Loader2Icon className="!size-5 !text-primary !animate-spin !flex-shrink-0" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
