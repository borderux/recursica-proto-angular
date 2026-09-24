import { http, HttpResponse } from 'msw';
import {
  emptyGreetings,
  greetings,
  malformedGreetings,
} from '../../data/greetings';
import { mockDelay } from '../delay';

export const description =
  'GET /api/greetings — the reference example for a mock API with default/error/empty/malformed scenarios.';

export const handlers = [
  http.get('/api/greetings', async () => {
    await mockDelay();
    return HttpResponse.json(greetings);
  }),
];

export const errorHandlers = [
  http.get('/api/greetings', async () => {
    await mockDelay();
    return new HttpResponse(null, { status: 500 });
  }),
];

export const emptyHandlers = [
  http.get('/api/greetings', async () => {
    await mockDelay();
    return HttpResponse.json(emptyGreetings);
  }),
];

export const malformedHandlers = [
  http.get('/api/greetings', async () => {
    await mockDelay();
    return HttpResponse.json(malformedGreetings);
  }),
];
