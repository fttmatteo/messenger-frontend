/**
 * Configuración de Vite
 * 
 * Este archivo configura el bundler Vite para el proyecto:
 * - Plugin de React para JSX/TSX
 * - Plugin de Tailwind CSS v4
 * - Alias de paths (@/ -> src/)
 * - Proxy para desarrollo (redirige peticiones al backend)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener __dirname en módulos ES (ESM no tiene __dirname nativo)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        // Alias para imports más limpios
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        // Proxy para redirigir peticiones al backend durante desarrollo
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:8080',
                ws: true,
            },
        },
    },
})
