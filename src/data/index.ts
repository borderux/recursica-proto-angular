/**
 * Registry of every mock dataset under `src/data/<name>/`. Adding a dataset
 * is just adding the folder — it's auto-discovered here for listing/tooling.
 *
 * Prototypes that consume a specific dataset should still import it
 * directly (e.g. `import { greetings } from "../../data/greetings"`) to get
 * full type safety; this registry exists for discovery, not typed
 * consumption.
 */
const modules = import.meta.glob<Record<string, unknown>>("./*/index.ts", {
  eager: true,
});

export interface MockDataset {
  name: string;
  /** What the dataset is for — from its `description` export, if any. */
  description?: string;
  module: Record<string, unknown>;
}

export const mockDatasets: MockDataset[] = Object.entries(modules)
  .flatMap(([path, mod]): MockDataset[] => {
    const name = path.match(/^\.\/([^/]+)\/index\.ts$/)?.[1];
    if (!name) return [];
    return [
      {
        name,
        description:
          typeof mod.description === "string" ? mod.description : undefined,
        module: mod,
      },
    ];
  })
  .sort((a, b) => a.name.localeCompare(b.name));
