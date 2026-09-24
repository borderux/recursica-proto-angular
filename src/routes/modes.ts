import { createContext, useContext } from "react";
import { useSearchParams } from "react-router";

/**
 * A named, numbered variant of a prototype: it selects which mock data
 * and/or which mock API behavior (success, error, empty, slow, a different
 * dataset entirely, ...) the prototype uses while rendering. A prototype
 * defines its own modes in a colocated `modes.ts` and decides what each
 * `id` actually does — this file only owns the URL convention and the
 * picker UI (`ModesPanel.tsx`). See `docs/PROTOTYPE.md` for the full
 * process/rationale.
 */
export interface Mode {
  /** Switched via `?mode=<id>` — must be a plain number. */
  id: number;
  /** Short label shown in the mode picker. */
  name: string;
  /** What this mode does differently (which data, which API behavior), for
   * the designer who asked for it. */
  description: string;
}

export interface UseModesResult {
  /** The mode named by `?mode=<id>`, or `modes[0]` if that param is
   * missing, non-numeric, or doesn't match any mode's `id`. `undefined` if
   * the prototype has no modes at all. */
  activeMode: Mode | undefined;
  /** Whether the mode-picker panel should be open — see the `useModes`
   * doc comment for exactly which URLs open it. */
  isPanelOpen: boolean;
  /** Sets `?mode=<id>`, closing the panel. */
  selectMode: (id: number) => void;
  /** Opens the picker panel without changing the active mode. */
  openPanel: () => void;
  /** Closes the picker panel, keeping the active mode as-is. */
  closePanel: () => void;
}

/**
 * Wires a prototype's `modes` array to the `?mode=<id>` URL convention:
 *
 * - `?mode=1` — selects that mode directly.
 * - `?mode` (no value) or `?modes` (any value, or none) — opens the picker
 *   panel instead of selecting a mode.
 * - No `mode` param, or one that isn't a recognized id — falls back to
 *   `modes[0]`.
 */
export function useModes(modes: Mode[]): UseModesResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawMode = searchParams.get("mode");
  const isNumericMode = rawMode !== null && /^\d+$/.test(rawMode);
  const isPanelOpen =
    searchParams.has("modes") || (searchParams.has("mode") && !isNumericMode);

  const requestedId = isNumericMode ? Number(rawMode) : undefined;
  const activeMode = modes.find((mode) => mode.id === requestedId) ?? modes[0];

  function selectMode(id: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("modes");
      next.set("mode", String(id));
      return next;
    });
  }

  function openPanel() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("modes", "1");
      return next;
    });
  }

  function closePanel() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("modes");
      if (activeMode) {
        next.set("mode", String(activeMode.id));
      } else {
        next.delete("mode");
      }
      return next;
    });
  }

  return { activeMode, isPanelOpen, selectMode, openPanel, closePanel };
}

/**
 * Carries a `<Prototype>`'s `useModes` result down to its children, so a
 * prototype reads it with `usePrototypeModes()` instead of calling
 * `useModes` itself. See `Prototype.tsx`.
 */
export const ModesContext = createContext<UseModesResult | null>(null);

/**
 * Reads the enclosing `<Prototype>`'s mode state — e.g. `activeMode` for a
 * data/API switch, or `openPanel` for a button. Call from anywhere inside
 * a prototype wrapped in `<Prototype>` (`Prototype.tsx`).
 */
export function usePrototypeModes(): UseModesResult {
  const state = useContext(ModesContext);
  if (!state) {
    throw new Error("usePrototypeModes must be used within a <Prototype>");
  }
  return state;
}
