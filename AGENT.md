# Agent Instructions

Rules for AI agents working in this repo. For the full infra/tooling
breakdown (build, lint, design-token pipeline, CI), see `ARCHITECTURE.md`.

## What this app does

An app that lets designers spin up quick, throwaway UI prototypes using AI
agents, built on the Recursica design system. `/` (Home) lists every
prototype in the project. Each prototype is its own page at
`/prototypes/<slug>`, self-contained in its own folder, and must not affect
any other prototype.

## How to add a prototype

See `docs/PROTOTYPE.md` for the process to follow first — the questions to
ask the designer about the UX, mock data/APIs, and modes. Mechanically:

1. Create `src/routes/prototypes/<slug>/index.tsx` — `<slug>` becomes both
   the folder name and the URL (`/prototypes/<slug>`), so pick a kebab-case
   name that matches what you want the route to be.
2. Default-export the page component.
3. Optionally export `meta`: `export const meta = { title, description }`.
   `title` is shown on the Home card and defaults to the slug if omitted;
   `description` is optional.
4. Build the UI with components from `@recursica/adapter-mantine-v8`, not
   raw `@mantine/core` or `@mantine/dates` — that's what keeps prototypes on
   the design system.
5. Wrap the page's content in `<Prototype>` (`src/routes/Prototype.tsx`) —
   see Modes below.

Nothing else needs to change — Home and routing auto-discover the folder.

## Mock data & mock APIs

The two exceptions to "no sharing between prototypes" (see Rules below):
mock data and mock APIs, since real prototypes need to call something and
that something should be reusable rather than reinvented per prototype.

- **Mock data** lives in `src/data/<name>/`. Export:
  - `description` — a plain-string summary of what the dataset is for.
    Required; it's how the registry (and the next agent) knows what a
    dataset is without opening it.
  - A TypeScript interface for the record shape and the good-case data
    array, both documented with JSDoc.
  - **Bad-data sets**, plural — an empty array (tests the empty state) and
    a set of malformed records (missing/wrong-typed fields, typed as
    `unknown[]` since they deliberately don't match the schema). Real
    prototypes need to survive bad data, not just the happy path.
  - It's auto-discovered by `src/data/index.ts`, but for full type safety
    import the dataset directly, e.g.
    `import { greetings } from "../../data/greetings"`.
- **Mock APIs** live in `src/api/<name>/`, using
  [Mock Service Worker](https://mswjs.io/). Export:
  - `description` — same idea as above, required.
  - `handlers` — the default-scenario MSW handlers, typed against the
    request/response shapes and documented with JSDoc.
  - **Error/bad-data scenario handlers** alongside it (e.g.
    `errorHandlers` returning a 5xx, `malformedHandlers` returning a
    schema-violating 200) — prototyping needs to exercise API failure and
    malformed-response handling, not just the success path.
  - It's auto-discovered and aggregated by `src/api/index.ts` — no manual
    wiring to register a new endpoint.
  - **Simulate real network latency** with `mockDelay()`
    (`src/api/delay.ts`) — `await` it at the top of every resolver. It
    defaults to `DEFAULT_DELAY_MS` (1000ms); to make the delay configurable
    per mode, write the handler as a factory that takes `delayMs` and
    passes it through, so a mode with a different handler set can also
    pass a different latency — see `src/api/inventory/`'s `createHandlers`
    for a working example.
- **Switch scenarios at runtime** with `worker.use(...someHandlers)`
  (import `worker` from `src/api/worker.ts`), and revert with
  `worker.resetHandlers()`. Drive the choice from a URL search param (see
  Routing & state below) so a broken/empty/error state is a link, not a
  manual repro step.
- The mock worker only runs in dev (`enableMocking()` in `src/main.tsx`);
  prototypes call `fetch("/api/...")` as if a real backend existed.
- See `src/data/greetings/` + `src/api/greetings/` (data + the endpoint
  that serves it, including error/bad-data scenarios) and
  `src/routes/prototypes/demo/` (a prototype consuming its own dataset +
  API, switched via modes — see below) for a working example.

## Modes

Every prototype's `index.tsx` wraps its content in the shared
`<Prototype>` component (`src/routes/Prototype.tsx`) — this is what makes
the mode-picker panel available via `?mode`/`?modes` even for a prototype
with no modes defined, so don't skip it just because a prototype doesn't
need modes yet.

Ask the designer whether they want to see a prototype in more than one
state (different data, or different API behavior) — see `docs/PROTOTYPE.md`
for the full process. If so:

- The prototype's own folder gets a colocated `modes.ts` exporting
  `modes: Mode[]` (`Mode` from `src/routes/modes.ts`), each with a numeric
  `id`, a `name`, and a `description` (from the designer).
- Pass it to `<Prototype modes={modes}>` and read the active mode from
  inside with `usePrototypeModes()` (`src/routes/modes.ts`) — the
  prototype itself decides what each mode `id` does (which dataset, which
  handler set).
- The URL convention: `?mode=1` selects a mode directly; `?mode` (no
  value) or `?modes` opens the mode-picker panel instead.
- **Modes are a hidden feature.** Unless the designer explicitly asks for
  it, a prototype's own UI must never surface the word "mode", a button/link
  that opens the panel, or the current mode's name — the panel is reached
  only by adding the search param to the URL by hand.

## Routing & state

- **Everything is routable.** This applies to pages first, but also to
  modals — a modal should be routable within its page (e.g. via a search
  param) so the user can navigate back to it, share it, or reload without
  losing it.
- **Keep state at the page level; components should be stateless.**
- **Transitioning to another page? Pass state through the URL** (path
  segments and search params) instead of global state or storage. That's
  what makes routes shareable/restorable with nothing but the URL — no
  server or client storage involved.
- If a transition genuinely has too much data to encode in the URL, that's
  the signal a prototype needs global state. For now, global state means a
  **React context + provider that the prototype owns and wraps itself in**
  — since a prototype can't know about any other prototype (see below),
  it must not reach for a shared/app-level provider.

## Forms

Use **[React Hook Form](https://react-hook-form.com/)**, wiring each field
through its `Controller` component (not `register()`) so the form only
depends on the `value`/`onChange`/`label`/`error` contract every Recursica
adapter exposes, not on a specific adapter's ref-forwarding — see Forms in
`ARCHITECTURE.md` for why and how, and
`src/routes/prototypes/demo/` for a working example.

## Rules

- Never hand-edit generated files: `recursica_*.json`,
  `recursica_variables_scoped.css`. They come from Recursica's own export
  tooling.
- **No code sharing between prototypes.** A prototype folder must stay
  fully self-contained — never import from, or modify, another prototype's
  folder. There should be no shared code or folders outside of each
  prototype's own folder, other than the app chrome under `src/routes/`,
  the registry (`src/routes/prototypes/index.ts`), the modes convention
  (`src/routes/modes.ts`, `src/routes/ModesPanel.tsx`,
  `src/routes/Prototype.tsx`), and the mock data/API folders (`src/data/`,
  `src/api/`) described above.
- Don't edit `src/App.tsx` or `src/routes/Home.tsx` just to add a
  prototype; the folder convention handles routing and listing for you.
- Before considering work done, run `npm run check-types` and
  `npm run lint`.
- Don't commit. Leave changes staged/unstaged for the human to review and
  commit themselves.
- Use forms when managing user input that should be submitted to the back-end
- Consider negative/failure cases also when creating prototypes
- **Modes are a hidden feature.** Never expose a mode-switching element or mention modes in prototypes
