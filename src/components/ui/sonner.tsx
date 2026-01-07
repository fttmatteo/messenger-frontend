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
      offset={isMobile ? "calc(env(safe-area-inset-top, 0px) + 12px)" : "24px"}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast !bg-background/95 !backdrop-blur-xl !border-border/50 !shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] !rounded-2xl !p-4 !gap-3",
            "!fixed !inset-x-0 !mx-auto !w-fit !min-w-[320px] !max-w-[420px] !flex !items-start !border-l-4"
          ),
          title: "!font-bold !text-sm !leading-tight",
          description: "!text-muted-foreground !text-[11px] !mt-1 !leading-normal",
          actionButton: "!bg-primary !text-primary-foreground !rounded-xl !px-4 !h-8 !text-[11px] !font-bold !ml-auto",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-xl !px-4 !h-8 !text-[11px] !font-bold",
          error: "!border-l-red-500 !text-foreground",
          success: "!border-l-green-500 !text-foreground",
          info: "!border-l-blue-500 !text-foreground",
          warning: "!border-l-amber-500 !text-foreground",
        }
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <TriangleAlertIcon className="size-5 text-red-500" />,
        loading: <Loader2Icon className="size-5 text-primary animate-spin" />,
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
