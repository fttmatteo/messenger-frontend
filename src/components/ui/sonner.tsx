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
      offset={isMobile ? "calc(env(safe-area-inset-top, 0px) + 16px)" : undefined}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast !bg-background/90 !backdrop-blur-md !border-border/40 !shadow-2xl !rounded-2xl !p-4 !gap-3",
            "!max-w-[calc(100vw-120px)] !mx-auto !min-w-[240px]"
          ),
          description: "!text-muted-foreground !text-xs",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg !px-4 !h-9 !text-xs !font-semibold",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-lg !px-4 !h-9 !text-xs !font-semibold",
          error: "!bg-red-500/90 !border-red-600/50 [&_*]:!text-white",
          success: "!bg-green-600/90 !border-green-700/50 [&_*]:!text-white",
          info: "!bg-blue-600/90 !border-blue-700/50 [&_*]:!text-white",
          warning: "!bg-amber-500/90 !border-amber-600/50 [&_*]:!text-white",
        }
      }}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <TriangleAlertIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
