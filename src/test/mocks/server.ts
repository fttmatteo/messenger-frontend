import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';
import { handlers } from '@/test/mocks/handlers';

/**
 * Configuración del servidor de intercepción de solicitudes para entornos de prueba (Node.js/Vitest).
 * Utiliza los handlers definidos en ./handlers.ts para mockear respuestas de red.
 */
export const server = setupServer(...(handlers as RequestHandler[]));
