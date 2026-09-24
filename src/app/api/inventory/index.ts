import { http, HttpResponse } from 'msw';
import { inventory, type InventoryItem } from '../../data/inventory';
import { mockDelay } from '../delay';

export const description =
  "Serves and updates the GPU/server inventory dataset for the Demo Prototype's dashboard, including scenarios where the load or the update fails.";

/**
 * In-memory copy of the dataset, mutated by `PATCH /api/inventory/:id` so a
 * saved edit shows up on the next `GET /api/inventory` — mimicking a real
 * backend. Resets whenever the page reloads.
 */
const store: InventoryItem[] = inventory.map((item) => ({ ...item }));

const getInventory = http.get('/api/inventory', async () => {
  await mockDelay();
  return HttpResponse.json<InventoryItem[]>(store);
});

const getInventoryError = http.get('/api/inventory', async () => {
  await mockDelay();
  return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
});

const updateInventoryItem = http.patch(
  '/api/inventory/:id',
  async ({ params, request }) => {
    await mockDelay();
    const updates = (await request.json()) as Partial<InventoryItem>;
    const index = store.findIndex((item) => item.id === params['id']);
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    store[index] = { ...store[index], ...updates, id: store[index].id };
    return HttpResponse.json<InventoryItem>(store[index]);
  },
);

const updateInventoryItemError = http.patch('/api/inventory/:id', async () => {
  await mockDelay();
  return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
});

/**
 * Default scenario: `GET /api/inventory` returns the current inventory,
 * `PATCH /api/inventory/:id` saves an edit to it. This is what's registered
 * in the mock worker by default (see `src/app/api/index.ts`).
 */
export const handlers = [getInventory, updateInventoryItem];

/**
 * Load-failure scenario: `GET /api/inventory` returns a 500, so the
 * dashboard shows an error instead of loading. Swap it in at runtime with
 * `worker.use(...loadErrorHandlers)` (see `src/app/api/worker.ts`), and back
 * out with `worker.resetHandlers()`.
 */
export const loadErrorHandlers = [getInventoryError, updateInventoryItem];

/**
 * Submit-failure scenario: the table loads normally, but
 * `PATCH /api/inventory/:id` returns a 500 — for checking how the edit
 * modal surfaces a failed save.
 */
export const submitErrorHandlers = [getInventory, updateInventoryItemError];
