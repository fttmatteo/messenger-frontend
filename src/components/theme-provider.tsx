import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { useEffect } from "react"

function ThemeColorSync() {
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            // Colors must match index.css variables
            // Light: hsl(0 0% 100%) -> #ffffff
            // Dark: hsl(0 0% 8%) -> #141414
            metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#141414' : '#ffffff')
        }
    }, [resolvedTheme])

    return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeColorSync />
            {children}
        </NextThemesProvider>
    )
}
