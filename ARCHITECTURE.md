# Architecture

## Overview

A starting point for quick, throwaway UI prototypes built on the Recursica design system. A plain application — no Storybook, no published package, nothing to publish to npm — just enough scaffolding and tooling to spin up a prototype fast without reinventing the build/lint/format setup each time.

## Stack

- **Angular CLI** (application builder, esbuild-based, with a Vite-powered dev server) — dev server and build.
- **Angular Router** — the root shell wires up one route per page/prototype, discovered automatically (see App structure below).
- **TypeScript**, strict mode, with the Angular compiler's own template type-checking (`strictTemplates`) layered on top of the usual type check. `npm run check-types` runs the full project + template check.
- **[Mock Service Worker](https://mswjs.io/)** — mocks the API layer shared across prototypes. It intercepts at the network layer rather than inside any particular UI framework, so it needs no framework-specific wiring beyond starting it. `public/mockServiceWorker.js` is the generated service worker (`msw init`, excluded from Prettier); `main.ts`'s `enableMocking()` starts it dev-only, before the app bootstraps. See `src/api/` under App structure below.
- **Reactive Forms** — form state/validation, bound directly to design-system inputs. See Forms below.

## Design system integration

- The Recursica component layer is the only source of UI components a prototype should import — never reach for the underlying UI kit's components directly.
- **`recursica.json`** — project manifest read by Recursica's own tooling (schema-versioned; declares this project by name/path).
- **`recursica_brand.json`, `recursica_tokens.json`, `recursica_ui-kit.json`, `recursica_variables_scoped.css`** — exported Recursica design tokens. Never hand-edit these — they come from Recursica's own export tooling, and are excluded from Prettier accordingly.
- **A build-time token-variable check** — rewrites/validates the design-token CSS variables at build time. Runs in strict mode only in production, so a missing/renamed token warns locally but fails a production build.
- **A generated font stylesheet** — resolves the brand's primary/secondary typefaces to their Google Fonts URLs and writes the `@import` lines for just those. Regenerates on every dev/build (and on save, if either source file changes while the dev server is running), so the font imports always match the current brand. Every step (files exist, the typeface is actually listed, its URL is well-formed) is validated with no fallback — a bad or missing source throws and aborts the build/dev-server rather than rendering with a silently wrong font.
- **A design-system lint rule** flags the adapter's style-override escape hatch, so it doesn't quietly become permanent — use a supported variant/prop instead, or track its removal.
- **Angular Material's own theming** is a Sass build-time step (no runtime `ThemeProvider`) — `src/styles.scss` calls its `theme()` mixin twice, scoped under the `data-recursica-theme="light"|"dark"` attribute the theme-provider component sets on `<html>`, so one attribute write drives both Recursica's and Material's theme variables together. The production bundle-size budget in `angular.json` is raised well past Angular's default — `recursica_variables_scoped.css` alone is close to 2MB, and that's expected, not bloat to chase down.

## Forms

**Reactive Forms** (`FormGroup`/`FormControl`) handle form state/validation, bound straight to design-system inputs:

```ts
this.form = new FormGroup({
  email: new FormControl("", [Validators.required]),
});
```

```html
<rec-text-field label="Email" [formControl]="form.controls.email" />
```

Why this works with no extra wiring: every design-system form control implements the platform's own value-accessor/validator contract directly, so binding a control straight to the field just works — there's no separate controlled-input bridge to maintain by hand.

See an existing prototype that submits a form (edit modal, settings page, etc.) for a full working example — text/number inputs, dropdowns, a text area, and a submit handler wired to a mock API.

## Code quality tooling

- **Linting** — the framework's recommended rules, plus the Recursica plugin that flags design-system misuse (currently just the style-override escape hatch).
- **Formatting** — Prettier, default config. Generated files (the `recursica_*` exports, the generated service worker) are excluded since they're not hand-authored.
- **Pre-commit** — a staged-files hook runs formatting + lint with autofix + a full project type/template check (not just the staged files), so a bad commit can't slip through partial coverage.

## Scripts (`package.json`)

| Script                    | What it does                                                           |
| ------------------------- | ---------------------------------------------------------------------- |
| `dev`                     | dev server                                                             |
| `build`                   | format → lint:fix → lint → full type/template check → production build |
| `preview`                 | serve the production build locally                                     |
| `lint` / `lint:fix`       | lint the project, with/without autofix                                 |
| `format` / `format:check` | Prettier over the whole tree                                           |
| `check-types`             | full project type/template check                                       |

## CI (`.github/workflows/`)

- **`pull-request.yml`** — on every PR: one install/build job (format, lint, type-check, and build all happen inside the single build step) publishes the result as a live preview and posts the link into the PR description. A failing build/lint/type-check fails the PR and skips the preview. Tears the preview down automatically on PR close.
- **`deploy.yml`** — on push to `main`: builds and publishes to GitHub Pages. Ships a `404.html` fallback (a copy of `index.html`) so deep links into a client-side route still resolve, since Pages has no rewrite rules of its own.
  - **First-time setup** (not done by the workflow): GitHub Pages must be enabled once in repo Settings → Pages, source "Deploy from a branch" → `gh-pages`, after the first deploy run creates that branch.

## Crawler blocking

Every prototype here is throwaway and not meant to be found: `public/robots.txt` disallows everything, and the page carries a `noindex, nofollow, noarchive, nosnippet` meta tag.

## App structure

```
src/
  main.ts           # Entry point: enableMocking() → bootstrap → router
  styles.scss       # Global styles: Material theming, token CSS, fonts
  index.html
  recursica_fonts.css  # Generated font @imports — see below
  app/
    app.ts          # Root shell: wraps everything in the theme provider
    app.routes.ts   # one route per page/prototype, generated automatically
    home/           # "/" — lists every discovered prototype
    modes/          # Mode type + the `?mode=<id>` convention, the picker
                     #   panel, and the wrapper every prototype's page
                     #   renders through
    prototypes/     # auto-discovered: dropping a folder in registers a
      <slug>/       #   route, no manual wiring
        index.ts    #   page component
        modes.ts    #   optional: this prototype's mode definitions
    data/           # Mock datasets shared across prototypes
      <name>/       #   a typed, documented data array; import it directly
                     #   from a prototype for full type safety
    api/            # Mock APIs (MSW) shared across prototypes
      worker.ts     # the MSW worker, started at bootstrap
      <name>/       # exports `handlers`, typed + documented; just add the
                     #   folder to register a new mock endpoint
public/             # Static assets served as-is (favicon, icons, the
                     #   generated service worker)
docs/
  PROTOTYPE.md      # Process for creating a new prototype
```

Home (`/`) lists every discovered prototype, each self-contained in its own folder so prototypes can't affect each other — except for the shared mock data/API folders, which any prototype may use (see Prototype conventions below).

## Prototype conventions

- **Isolation.** No code sharing between prototypes — no shared code or folders outside a prototype's own folder, other than the app chrome, the routing registry, the modes convention, and the shared mock data/API folders below. A prototype must not import from or modify another prototype's folder.
- **Mock data & mock APIs are the two deliberate exceptions.** Real prototypes need to call something, so typed, documented datasets and [MSW](https://mswjs.io/) handlers are shared and reusable across prototypes. Each dataset/API also exports a `description` string so its purpose is discoverable without opening the file.
- **Bad-data and API-error scenarios are first-class, not an afterthought.** Every dataset ships bad-data sets alongside the good one (empty, and malformed/schema-violating records), and every mock API ships error/malformed handlers alongside its default one.
- **Every prototype renders through the shared page wrapper**, which always mounts the mode-picker panel — so `?mode`/`?modes` opens it even for a prototype with no modes defined, not just ones that opted in.
- **Modes select which mock data/API behavior a prototype uses**, by number, via `?mode=<id>`. A prototype that wants modes adds a colocated `modes.ts`, and reads the active one from the shared modes service. See `docs/PROTOTYPE.md` for the designer-facing process.
- **Everything is routable**, including modals — a modal should be routable within its page (e.g. via a search param) so it can be navigated back to, shared, or reloaded without being lost.
- **State lives at the page level; components are stateless.** Transitions between pages pass state through the URL (path segments and search params) rather than global state or storage, so routes stay shareable/restorable from the URL alone.
- **Global state, when the URL can't hold enough:** a scoped service the prototype owns and provides for itself. There's no shared/app-level state, since prototypes can't know about each other.

See `AGENT.md` for the full rules AI agents follow when working on prototypes.
