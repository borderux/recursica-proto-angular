import type { Mode } from "../../modes";

/**
 * This prototype's modes — each swaps in a different set of handlers for
 * `/api/inventory` (see `index.tsx` and `src/api/inventory/`).
 */
export const modes: Mode[] = [
  {
    id: 1,
    name: "Default",
    description: "The table loads normally, and edits save successfully.",
  },
  {
    id: 2,
    name: "Load fails",
    description:
      "GET /api/inventory returns a 500 — the table shows an error instead of loading.",
  },
  {
    id: 3,
    name: "Submit fails",
    description:
      "The table loads normally, but saving an edit (PATCH /api/inventory/:id) returns a 500.",
  },
];
