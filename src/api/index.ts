import type { HttpHandler } from "msw";

interface ApiModule {
  handlers?: HttpHandler[];
  description?: string;
}

/**
 * Registry of every mock API under `src/api/<name>/`. Adding a mock API is
 * just adding the folder and exporting `handlers` (+ a `description`) — it's
 * auto-discovered and included in the mock worker, no manual wiring needed.
 */
const modules = import.meta.glob<ApiModule>("./*/index.ts", {
  eager: true,
});

export interface MockApi {
  name: string;
  /** What the API is for — from its `description` export, if any. */
  description?: string;
  module: ApiModule;
}

export const mockApis: MockApi[] = Object.entries(modules)
  .flatMap(([path, mod]): MockApi[] => {
    const name = path.match(/^\.\/([^/]+)\/index\.ts$/)?.[1];
    if (!name) return [];
    return [{ name, description: mod.description, module: mod }];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/** Every API's default `handlers`, flattened for `setupWorker` (see `src/api/worker.ts`). */
export const apiHandlers: HttpHandler[] = mockApis.flatMap(
  ({ module }) => module.handlers ?? [],
);
