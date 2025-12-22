import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"

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
        includeAssets: ['favicon.ico', 'icons/*.png'],
        manifest: {
          name: env.VITE_APP_NAME || 'PLAK',
          short_name: 'PLAK',
          description: env.VITE_APP_DESCRIPTION || 'Sistema de gestión de mensajería PLAK',
          theme_color: '#4169e1',
          background_color: '#000000',
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
              form_factor: 'wide',
            },
            {
              src: '/screenshots/mobile.png',
              sizes: '390x844',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
        },
        workbox: {
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
          // Manual chunking for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
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
