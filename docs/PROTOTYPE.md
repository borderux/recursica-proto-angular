# Creating a new prototype

This is the process to follow — designer conversation first, then code —
when someone asks for a new prototype. For the file mechanics (what to
create, how routing/discovery works), see AGENT.md's "How to add a
prototype"; this document is about what to ask before writing any of it.

## 1. Name it

Ask for (or propose) a short, kebab-case name. It becomes both the
prototype's folder and its URL: `src/routes/prototypes/<name>/` →
`/prototypes/<name>`.

## 2. Understand the UX

Get the designer's description of what they're prototyping: the flow, the
screens/states involved, and what it needs to demonstrate.

## 3. Ask about data and APIs

Essential questions for every prototype — don't skip these:

- **What mock data does it need?** What shape, roughly how many records,
  which fields matter to the UX being shown.
- **What APIs (if any) does it call?** What each one returns on success.
- **Check what already exists before proposing something new.** List
  `src/data/` and `src/api/` (every entry exports a `description`, so this
  is quick) and reuse a dataset/API instead of duplicating a shape that's
  already there.
- **Mention related existing prototypes**, if any — worth a look before
  building something similar from scratch.

## 4. Ask about modes

Ask whether the designer wants to see this prototype in more than one
state — different data, or different API behavior (success, empty, error,
slow). If so, each state becomes a **mode** — see below.

## 5. Build it

Create `src/routes/prototypes/<name>/index.tsx` per AGENT.md's mechanical
steps, using the data/API entries from step 3 and the modes from step 4.

## Modes

A **mode** is a named, numbered variant of a prototype: it selects which
mock data and/or which mock API behavior the prototype uses while
rendering — the success case, an empty result, an API error, a different
dataset entirely. Modes let a designer flip between "what does this look
like with data", "what does this look like empty", "what does this look
like when the API fails", without a separate prototype for each.

### Structure

A prototype that has modes adds one file to its own folder:

```
src/routes/prototypes/<name>/
  index.tsx   # page component
  modes.ts    # this prototype's mode definitions
```

`modes.ts` exports a `modes: Mode[]` array (`Mode` from
`src/routes/modes.ts`), each entry with:

- `id` — a number; this is what `?mode=<id>` switches on.
- `name` — short label shown in the mode picker.
- `description` — from the designer, in plain language: what this mode
  does differently (which data, which API behavior).

```ts
import type { Mode } from "../../modes";

export const modes: Mode[] = [
  { id: 1, name: "Default", description: "Loads normally with sample data." },
  { id: 2, name: "Empty", description: "No records — shows the empty state." },
  { id: 3, name: "API error", description: "The API call fails with a 500." },
];
```

The prototype's `index.tsx` passes these to `<Prototype modes={modes}>`
(`src/routes/Prototype.tsx`), which every prototype's page wraps its
content in, and reads the active one from inside with
`usePrototypeModes()` (`src/routes/modes.ts`). The prototype itself
decides what each mode number actually does — which dataset, which
handler set — the same way it already owns everything else about its own
page.

A prototype with no modes still wraps its content in `<Prototype>` (just
without a `modes` prop) — that's what makes the picker panel open via
`?mode`/`?modes` for every prototype, not only ones that define modes.

### URL convention

- `?mode=1` — selects mode `1` directly. Always numeric, so a specific
  mode is a plain, shareable link.
- `?mode` (no value) or `?modes` (any value, or none) — opens the mode
  picker panel instead of selecting a mode.
- No `mode` param, or one that doesn't match a known id — falls back to
  the first mode in the array.

### The picker panel

`ModesPanel` slides out from the right, listing every mode by name and
description. Clicking one sets `?mode=<id>`, closes the panel, and
re-renders the prototype in that mode.

See `src/routes/prototypes/demo/` for a complete, working example (three
modes: default, a failed load, and a failed submit).
