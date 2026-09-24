import type { ReactNode } from "react";
import { ModesContext, useModes, type Mode } from "./modes";
import { ModesPanel } from "./ModesPanel";

interface PrototypeProps {
  /** This prototype's modes, from its colocated `modes.ts`. Omit it (or
   * pass nothing) if the prototype doesn't define any modes — the picker
   * panel still opens via `?mode`/`?modes`, it just has nothing to list. */
  modes?: Mode[];
  children: ReactNode;
}

/**
 * Shared chrome every prototype's `index.tsx` renders through, instead of
 * calling `useModes`/`ModesPanel` itself. Owns the `?mode=<id>` / `?mode` /
 * `?modes` URL convention and always mounts the picker panel — so opening
 * it works for every prototype, even one that hasn't defined any modes
 * yet. Read the mode state from inside `children` with `usePrototypeModes`
 * (`modes.ts`). See `docs/PROTOTYPE.md`.
 */
export function Prototype({ modes = [], children }: PrototypeProps) {
  const state = useModes(modes);

  return (
    <ModesContext.Provider value={state}>
      {children}
      <ModesPanel
        modes={modes}
        activeMode={state.activeMode}
        isOpen={state.isPanelOpen}
        onSelect={state.selectMode}
        onClose={state.closePanel}
      />
    </ModesContext.Provider>
  );
}
