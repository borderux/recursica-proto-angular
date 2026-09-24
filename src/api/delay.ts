import { delay } from "msw";

/**
 * Default artificial latency applied to mock API responses, in
 * milliseconds — realistic enough to exercise loading states without being
 * annoying to click through. A mock API can override it per handler set
 * (e.g. a differently-configured mode) instead of hardcoding it — see
 * `src/api/inventory/` for a working example.
 */
export const DEFAULT_DELAY_MS = 1000;

/**
 * Waits `ms` (default `DEFAULT_DELAY_MS`) before a mock handler resolves,
 * simulating real network latency. Call it at the top of an MSW resolver:
 * `await mockDelay()` for the default, `await mockDelay(0)` for none, or
 * thread a custom value in from a handler factory to make it configurable
 * per mode.
 */
export async function mockDelay(ms: number = DEFAULT_DELAY_MS) {
  await delay(ms);
}
