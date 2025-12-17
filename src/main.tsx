/**
 * Punto de Entrada de la Aplicación React
 * 
 * Este archivo inicializa la aplicación React y la monta
 * en el elemento DOM con id="root" definido en index.html.
 * 
 * StrictMode está habilitado para:
 * - Detectar efectos secundarios inseguros
 * - Advertir sobre APIs deprecadas
 * - Detectar problemas con el ciclo de vida
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Renderiza la aplicación en el DOM.
 * 
 * createRoot es la nueva API de React 18 para renderizado concurrente.
 * El operador ! indica que estamos seguros de que el elemento existe.
 */
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
