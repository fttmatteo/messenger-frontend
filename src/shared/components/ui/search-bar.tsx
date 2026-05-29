import * as React from "react"
import { Search, X, Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isLoading?: boolean
  onClear?: () => void
}

/**
 * Componente de barra de búsqueda profesional optimizado.
 * Incluye atajos de teclado, estado de carga y botón de limpieza rápida.
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, isLoading = false, onClear, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    const handleRef = (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLSelectElement
        ) {
          return
        }

        if (e.key === "/" || (e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        const event = {
          target: { value: "" },
          currentTarget: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      inputRef.current?.focus()
    }

    const hasValue = value !== undefined && value !== null && String(value).length > 0

    return (
      <div className={cn("relative flex items-center !h-[32px] !min-h-[32px] !max-h-[32px] box-border w-full max-w-sm group", className)}>
        {/* Ícono Izquierdo (Búsqueda o Spinner) */}
        <div className="absolute left-2.5 flex items-center justify-center text-muted-foreground pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
        </div>

        {/* Input */}
        <input
          ref={handleRef}
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            "flex !h-[32px] !min-h-[32px] !max-h-[32px] w-full box-border rounded-full border border-transparent bg-muted/40 px-3 text-xs shadow-none transition-all outline-none m-0",
            "pl-8",
            hasValue ? "pr-8" : "pr-8",
            "placeholder:text-muted-foreground",
            "focus-visible:border-border focus-visible:bg-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          {...props}
        />

        {/* Elemento Derecho (Botón Limpiar o Atajo) */}
        <div className="absolute right-1 flex items-center justify-center">
          {hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100 mr-1 transition-opacity group-focus-within:opacity-0">
              <span className="text-xs">/</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"
