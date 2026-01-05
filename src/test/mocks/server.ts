import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';
import { handlers } from '@/test/mocks/handlers';

export const server = setupServer(...(handlers as RequestHandler[]));
