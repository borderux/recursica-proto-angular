import { setupWorker } from 'msw/browser';
import { apiHandlers } from './registry.generated';

export const worker = setupWorker(...apiHandlers);
