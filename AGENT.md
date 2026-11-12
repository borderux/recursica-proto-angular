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
ask the designer about the UX, mock data/APIs, and stories. Mechanically:

1. Create `src/app/prototypes/<slug>/index.ts` — `<slug>` becomes both
   the folder name and the URL (`/prototypes/<slug>`), so pick a kebab-case
   name that matches what you want the route to be.
2. Default-export the page component.
3. Optionally export `meta`: `export const meta = { title, description }`.
   `title` is shown on the Home card and defaults to the slug if omitted;
   `description` is optional.
4. Build the UI with components from `@recursica/adapter-angular-material`,
   not raw `@angular/material`/`@angular/cdk` — that's what keeps
   prototypes on the design system.
5. Wrap the page's content in the shared prototype wrapper component — see
   Stories below.

Nothing else needs to change — Home and routing auto-discover the folder.

## Mock data & mock APIs

The two exceptions to "no sharing between prototypes" (see Rules below):
mock data and mock APIs, since real prototypes need to call something and
that something should be reusable rather than reinvented per prototype.

- **Mock data** lives in `src/app/data/<name>/`. Export:
  - `description` — a plain-string summary of what the dataset is for.
    Required; it's how the registry (and the next agent) knows what a
    dataset is without opening it.
  - A TypeScript interface for the record shape and the good-case data
    array, both documented.
  - **Bad-data sets**, plural — an empty array (tests the empty state) and
    a set of malformed records (missing/wrong-typed fields, typed as
    `unknown[]` since they deliberately don't match the schema). Real
    prototypes need to survive bad data, not just the happy path.
  - It's auto-discovered by `src/app/data/index.ts`, but for full type safety
    import the dataset directly, e.g.
    `import { greetings } from "../../data/greetings"`.
- **Mock APIs** live in `src/app/api/<name>/`, using
  [Mock Service Worker](https://mswjs.io/). Export:
  - `description` — same idea as above, required.
  - `handlers` — the default-scenario MSW handlers, typed against the
    request/response shapes and documented.
  - **Error/bad-data scenario handlers** alongside it (e.g.
    `errorHandlers` returning a 5xx, `malformedHandlers` returning a
    schema-violating 200) — prototyping needs to exercise API failure and
    malformed-response handling, not just the success path.
  - It's auto-discovered and aggregated by `src/app/api/index.ts` — no manual
    wiring to register a new endpoint.
  - **Simulate real network latency** with `mockDelay()`
    (`src/app/api/delay.ts`) — `await` it at the top of every resolver. It
    defaults to `DEFAULT_DELAY_MS` (1000ms); to make the delay configurable
    per story, write the handler as a factory that takes `delayMs` and
    passes it through, so a story with a different handler set can also
    pass a different latency.
- **Switch scenarios at runtime** with `worker.use(...someHandlers)`
  (import `worker` from `src/app/api/worker.ts`), and revert with
  `worker.resetHandlers()`. Drive the choice from a URL search param (see
  Routing & state below) so a broken/empty/error state is a link, not a
  manual repro step.
- The mock worker only runs in dev (`enableMocking()` in `src/main.ts`);
  prototypes call `fetch("/api/...")` as if a real backend existed.
- See `src/app/data/greetings/` + `src/app/api/greetings/` for a working example of
  a dataset paired with its mock API, including error/bad-data scenarios.

## Stories

Every prototype's page wraps its content in the shared prototype wrapper
component — this is what makes the story-picker panel available via
`?story`/`?stories` even for a prototype with no stories defined, so don't
skip it just because a prototype doesn't need stories yet.

Ask the designer whether they want to see a prototype in more than one
state (different data, or different API behavior) — see `docs/PROTOTYPE.md`
for the full process. If so:

- The prototype's own folder gets a colocated `stories.ts` exporting
  `stories: Story[]` (`Story` from the shared stories module), each with a
  numeric `id`, a `name`, and a `description` (from the designer).
- Pass it to the wrapper component and read the active story from inside
  via the shared stories service — the prototype itself decides what each
  story `id` does (which dataset, which handler set).
- The URL convention: `?story=1` selects a story directly; `?story` (no
  value) or `?stories` opens the story-picker panel instead.
- **Stories are a hidden feature.** Unless the designer explicitly asks for
  it, a prototype's own UI must never surface the word "story", a
  button/link that opens the panel, or the current story's name — the
  panel is reached only by adding the search param to the URL by hand.

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
  **scoped service that the prototype owns and provides for itself** —
  since a prototype can't know about any other prototype (see below), it
  must not reach for a shared/app-level provider.

## Forms

Use **Reactive Forms** (`FormGroup`/`FormControl`), bound directly to
design-system inputs via `[formControl]`/`[formControlName]` — every
Recursica adapter form control implements the value-accessor/validator
contract directly, so there's no separate bridging layer to write. See
Forms in `ARCHITECTURE.md` for why and how.

## Rules

- **This is a playground, not Recursica code.** The project mimics an
  application so designers can prototype; it is not part of Recursica
  itself, so everyone is free to modify any of its code.
- **Adapter issues get filed, not worked around.** If you find a problem in
  the Recursica adapter in use, file a GitHub issue against the adapter
  rather than working around or patching it.
- **UI comes only from the configured Recursica adapter's components.** No
  components built from raw HTML elements (`div`, `span`, etc.), no custom
  CSS/SCSS or inline `style`, and no over-styling (`overStyle` or similar) —
  use the adapter's components and their own styling props/variants. Compound
  components made out of Recursica components are fine.
- **The Angular adapter is a published npm dependency.**
  `@recursica/adapter-angular-material` must come from the npm registry in
  `package.json` like any other dependency. Never symlink it, `npm link` it,
  use a `file:`/`link:` path to a local checkout, or vendor it as a packed
  `.tgz` — pull published versions only.
- Never hand-edit generated files: `recursica_*.json`,
  `recursica_variables_scoped.css`. They come from Recursica's own export
  tooling.
- **No code sharing between prototypes.** A prototype folder must stay
  fully self-contained — never import from, or modify, another prototype's
  folder. There should be no shared code or folders outside of each
  prototype's own folder, other than the app chrome under `src/app/`, the
  routing registry, the stories convention, and the mock data/API folders
  (`src/app/data/`, `src/app/api/`) described above.
- Don't edit the root app shell or Home page just to add a prototype; the
  folder convention handles routing and listing for you.
- Use forms for any user input that is submitted to the back-end.
- Prototype the failure cases too: empty, error, and malformed-data states,
  not just the happy path.
- **Stories are a hidden feature** (see Stories above) — never expose a
  story-switching element or mention stories in a prototype's UI.
- Before considering work done, run `npm run check-types` and
  `npm run lint`.
- Don't commit. Leave changes staged/unstaged for the human to review and
  commit themselves.
