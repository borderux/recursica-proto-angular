import { http, HttpResponse } from "msw";
import { inventory, type InventoryItem } from "../../data/inventory";
import { DEFAULT_DELAY_MS, mockDelay } from "../delay";

/**
 * What this mock API is for — shown by the API registry
 * (`src/api/index.ts`) so agents/designers can tell what an API is without
 * opening it.
 */
export const description =
  "Serves and updates the GPU/server inventory dataset for the Demo Prototype's dashboard, including scenarios where the load or the update fails.";

/**
 * In-memory copy of the dataset, mutated by `PATCH /api/inventory/:id` so a
 * saved edit shows up on the next `GET /api/inventory` — mimicking a real
 * backend. Resets whenever the page reloads.
 */
const store: InventoryItem[] = inventory.map((item) => ({ ...item }));

function getInventory(delayMs: number) {
  return http.get("/api/inventory", async () => {
    await mockDelay(delayMs);
    return HttpResponse.json<InventoryItem[]>(store);
  });
}

function getInventoryError(delayMs: number) {
  return http.get("/api/inventory", async () => {
    await mockDelay(delayMs);
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  });
}

function updateInventoryItem(delayMs: number) {
  return http.patch("/api/inventory/:id", async ({ params, request }) => {
    await mockDelay(delayMs);
    const updates = (await request.json()) as Partial<InventoryItem>;
    const index = store.findIndex((item) => item.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    store[index] = { ...store[index], ...updates, id: store[index].id };
    return HttpResponse.json<InventoryItem>(store[index]);
  });
}

function updateInventoryItemError(delayMs: number) {
  return http.patch("/api/inventory/:id", async () => {
    await mockDelay(delayMs);
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  });
}

/**
 * Builds this API's three scenarios with a shared artificial latency —
 * defaults to `DEFAULT_DELAY_MS` (1000ms). Pass a different value to make
 * the delay configurable per mode (e.g. a "Slow network" mode) without
 * touching the resolvers themselves.
 */
export function createHandlers(delayMs: number = DEFAULT_DELAY_MS) {
  return {
    /**
     * Default scenario: `GET /api/inventory` returns the current
     * inventory, `PATCH /api/inventory/:id` saves an edit to it. This is
     * what's registered in the mock worker by default (see
     * `src/api/index.ts`).
     */
    handlers: [getInventory(delayMs), updateInventoryItem(delayMs)],
    /**
     * Load-failure scenario: `GET /api/inventory` returns a 500, so the
     * dashboard shows an error instead of the table. Swap it in at runtime
     * with `worker.use(...loadErrorHandlers)` (see `src/api/worker.ts`),
     * and back out with `worker.resetHandlers()`.
     */
    loadErrorHandlers: [
      getInventoryError(delayMs),
      updateInventoryItem(delayMs),
    ],
    /**
     * Submit-failure scenario: the table loads normally, but
     * `PATCH /api/inventory/:id` returns a 500 — for checking how the edit
     * modal surfaces a failed save.
     */
    submitErrorHandlers: [
      getInventory(delayMs),
      updateInventoryItemError(delayMs),
    ],
  };
}

export const { handlers, loadErrorHandlers, submitErrorHandlers } =
  createHandlers();
