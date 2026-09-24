import { delay } from 'msw';

export const DEFAULT_DELAY_MS = 1000;

/** Simulates realistic network latency — `await` at the top of every resolver. */
export async function mockDelay(ms: number = DEFAULT_DELAY_MS): Promise<void> {
  await delay(ms);
}
