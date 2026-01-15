import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { visualizer } from "rollup-plugin-visualizer"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')

  // Determine if we're in development
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icons/*.png', 'screenshots/*.png', 'assets/*.png', 'assets/*.svg'],
        manifest: {
          name: env.VITE_APP_NAME || 'PLAK',
          short_name: 'PLAK',
          description: env.VITE_APP_DESCRIPTION || 'Sistema de gestión de mensajería PLAK',
          theme_color: '#141414',
          background_color: '#141414',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/screenshots/desktop.png',
              sizes: '1280x720',
              type: 'image/png',
            },
            {
              src: '/screenshots/mobile.png',
              sizes: '390x844',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          globPatterns: isDevelopment ? [] : ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: 'index.html',
          navigateFallbackAllowlist: [/^\/(?!api)/],
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      visualizer({
        filename: "stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Build configuration
    build: {
      // Generate sourcemaps for development/staging, but not for production
      sourcemap: !isProduction ? 'inline' : false,
      // Optimize for production
      minify: isProduction ? 'esbuild' : false,
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunking for better caching and loading performance
          manualChunks: {
            // Core React libraries - cached long-term
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Radix UI Primitives - dialogs, dropdowns, popovers
            'ui-primitives': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-hover-card',
            ],
            // Radix UI Layout - tabs, accordion, navigation
            'ui-layout': [
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-menubar',
              '@radix-ui/react-scroll-area',
            ],
            // Radix UI Inputs - form controls
            'ui-inputs': [
              '@radix-ui/react-checkbox',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-switch',
              '@radix-ui/react-slider',
              '@radix-ui/react-label',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
            ],
            // Form handling libraries
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Charts - large library, separate chunk
            'charts-vendor': ['recharts'],
            // Maps - loaded on demand
            'maps-vendor': ['@react-google-maps/api'],
            // Animations - framer-motion is large
            'animation-vendor': ['framer-motion'],
          },
        },
      },
    },
    // Server configuration (only for development)
    server: isDevelopment ? {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/employees': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/dealerships': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/services': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      }
    } : undefined,
    // Preview server configuration
    preview: {
      port: 4173,
    },
  }
})
