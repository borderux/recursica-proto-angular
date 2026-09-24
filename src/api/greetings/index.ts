import { http, HttpResponse } from "msw";
import {
  greetings,
  emptyGreetings,
  malformedGreetings,
  type Greeting,
} from "../../data/greetings";
import { mockDelay } from "../delay";

/**
 * What this mock API is for — shown by the API registry
 * (`src/api/index.ts`) so agents/designers can tell what an API is without
 * opening it.
 */
export const description =
  "Serves the greetings mock dataset. Includes error and bad-data scenario handlers for exercising API-failure and malformed-response UI states.";

/**
 * Default scenario: `GET /api/greetings` → 200 with the valid greetings
 * dataset. This is what's registered in the mock worker by default (see
 * `src/api/index.ts`).
 */
export const handlers = [
  http.get("/api/greetings", async () => {
    await mockDelay();
    return HttpResponse.json<Greeting[]>(greetings);
  }),
];

/**
 * Error scenario: simulates the server failing outright (500). Swap it in
 * at runtime with `worker.use(...errorHandlers)` (see `src/api/worker.ts`),
 * and back out with `worker.resetHandlers()`.
 */
export const errorHandlers = [
  http.get("/api/greetings", async () => {
    await mockDelay();
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }),
];

/**
 * Empty scenario: `GET /api/greetings` → 200 with no records. For checking
 * the UI's empty state, as distinct from an error or malformed response.
 */
export const emptyHandlers = [
  http.get("/api/greetings", async () => {
    await mockDelay();
    return HttpResponse.json<Greeting[]>(emptyGreetings);
  }),
];

/**
 * Bad-data scenario: 200 OK, but the response body doesn't match the
 * `Greeting[]` schema — for checking defensive rendering, as distinct from
 * the error-handling exercised by {@link errorHandlers}.
 */
export const malformedHandlers = [
  http.get("/api/greetings", async () => {
    await mockDelay();
    return HttpResponse.json(malformedGreetings);
  }),
];
