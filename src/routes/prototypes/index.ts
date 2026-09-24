import type { ComponentType } from "react";

export interface PrototypeMeta {
  /** Display name shown on the Home list. Defaults to the folder name. */
  title?: string;
  /** Optional one-line description shown under the title on Home. */
  description?: string;
}

interface PrototypeModule {
  default: ComponentType;
  meta?: PrototypeMeta;
}

export interface Prototype {
  slug: string;
  title: string;
  description?: string;
  Component: ComponentType;
}

// Auto-discovers every prototype under src/routes/prototypes/<slug>/index.tsx.
// Adding a new prototype is just adding the folder — no route or Home-page
// wiring needed, so one prototype can never accidentally break another's
// routing.
const modules = import.meta.glob<PrototypeModule>("./*/index.tsx", {
  eager: true,
});

export const prototypes: Prototype[] = Object.entries(modules)
  .flatMap(([path, mod]): Prototype[] => {
    const slug = path.match(/^\.\/([^/]+)\/index\.tsx$/)?.[1];
    if (!slug) return [];
    return [
      {
        slug,
        title: mod.meta?.title ?? slug,
        description: mod.meta?.description,
        Component: mod.default,
      },
    ];
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));
