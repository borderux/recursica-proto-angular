# Architecture

## Overview

`recursica-proto-template` is a starting point for quick, throwaway UI prototypes built on the Recursica design system. It's a plain Vite + React app — no Storybook, no published package, nothing to publish to npm — just enough scaffolding and tooling to spin up a prototype fast without reinventing the build/lint/format setup each time.

## Stack

- **[Vite](https://vite.dev/)** (`vite.config.ts`) — dev server and build, via `@vitejs/plugin-react`.
- **React 19** + **[react-router](https://reactrouter.com/) 8** — `src/main.tsx` mounts the app inside a `BrowserRouter`; `src/App.tsx` declares routes, one per file under `src/routes/`.
- **TypeScript** — split via project references: `tsconfig.json` (root, no files of its own) references `tsconfig.app.json` (`src/`) and `tsconfig.node.json` (`vite.config.ts`). `npm run check-types` runs `tsc -b` across both.
- **[Mock Service Worker](https://mswjs.io/)** — mocks the API layer shared across prototypes. `public/mockServiceWorker.js` is the generated service worker (`msw init`, excluded from Prettier); `src/main.tsx`'s `enableMocking()` starts it dev-only, before the app renders. See `src/api/` under App structure below.
- **[React Hook Form](https://react-hook-form.com/)** — form state/validation, wired to design-system inputs via `Controller` rather than `register()`. See Forms below.

## Design system integration

- **`@mantine/core`, `@mantine/dates`, `@mantine/hooks`** — the underlying component/UI framework (peer to the adapter below).
- **`@recursica/adapter-mantine-v8`** — Recursica's component layer over Mantine. `main.tsx` wraps the app in `MantineProvider` then `RecursicaThemeProvider` (`theme="light"`), and pages import components from the adapter (e.g. `Container` in `src/routes/Home.tsx`) rather than straight from Mantine.
- **`recursica.json`** — project manifest read by Recursica's own tooling (schema-versioned; declares this project by name/path).
- **`recursica_brand.json`, `recursica_tokens.json`, `recursica_ui-kit.json`, `recursica_variables_scoped.css`** — exported Recursica design tokens. The `.css` file is imported directly in `main.tsx`; the `.json` files back the postcss step below and are excluded from Prettier (`.prettierignore`) since they're generated, not hand-authored.
- **`@recursica/recursica-postcss-vars`** (`postcss.config.js`) — rewrites/scopes the design-token CSS variables at build time, reading `recursica_variables_scoped.css`. Runs in `strict` mode only when `NODE_ENV=production`, so a missing/renamed token warns locally but fails a production build.
- **`src/recursica_fonts.css`** — generated (git-ignored) by a Vite plugin in `vite.config.ts`, imported by `main.tsx`. Resolves `brand.fonts.primary`/`secondary` in `recursica_brand.json` to their typeface's Google Fonts URL in `recursica_tokens.json` and writes `@import url(...)` lines for just those. Runs on every `dev`/`build` (and re-runs on save if either source file changes while `dev` is running), so the font imports always match the current brand — and `recursica_tokens.json` itself, which is large, is only ever read on the Node side, never imported into app code or the client bundle. Every step (files exist, the typeface is actually listed, its URL is well-formed and is a `fonts.googleapis.com` URL) is validated with no fallback — a bad or missing source throws and aborts the build/dev-server rather than rendering with a silently wrong font.
- **`postcss-preset-mantine`** — Mantine's own postcss helpers (e.g. `rem()`/`em()` conversion), run alongside the plugin above.
- **`@recursica/eslint-plugin`** — lints for design-system misuse. Currently just `recursica/no-over-styled` (`error`), which flags the adapter's `overStyled` escape hatch so it doesn't quietly become permanent (see the plugin's own guidance to use a supported variant/prop instead, or track removal). Wired into `eslint.config.mjs` by hand rather than via the plugin's `configs.recommended`, because that export is in old eslintrc shape (`plugins: ["recursica"]`) and flat config rejects it.

## Forms

**[React Hook Form](https://react-hook-form.com/)** handles form state/validation. Wire each field with its `Controller` component instead of `register()`:

```tsx
<Controller
  name="email"
  control={control}
  rules={{ required: "Email is required" }}
  render={({ field, fieldState }) => (
    <TextField
      label="Email"
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

Why `Controller` and not `register()`: `register()` returns a native `{ name, onChange, onBlur, ref }` bundle meant to be spread onto an uncontrolled `<input>`, which depends on the component forwarding `ref` straight through to the DOM node the way it currently does. `Controller`'s `render` prop only needs a component that accepts `value`/`onChange` (plus `label`/`error` for messages) — the controlled-input contract every Recursica adapter exposes, regardless of which UI library backs it. That's what keeps a form working if the adapter is ever swapped (e.g. Mantine → MUI), per the "everything must stay UI-library-agnostic" ask that drove this choice.

See `src/routes/prototypes/demo/` for a full working example (text/number inputs, dropdowns, a text area, and a submit handler wired to a mock API).

## Code quality tooling

- **ESLint** (`eslint.config.mjs`, flat config) — `@eslint/js` + `typescript-eslint` recommended rules over `**/*.{ts,tsx}`, plus `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (Vite fast-refresh safety), and the Recursica plugin above.
- **Prettier** (`prettier.config.mjs` — empty, i.e. all defaults; `.prettierignore` excludes `dist`, the generated `recursica_*` files, and the generated `public/mockServiceWorker.js`).
- **Husky + lint-staged** — `.husky/pre-commit` runs `npx lint-staged --config scripts/lint-staged.config.cjs`, which on staged `*.{json,md,css,scss}` runs Prettier, and on staged `*.{js,jsx,ts,tsx}` runs Prettier + `eslint --fix` + a full `check-types` pass across the whole project (not just the staged files). The JSON/MD/CSS glob filters out symlinks before invoking Prettier — Prettier hard-errors on an explicitly-named symlink (e.g. `CLAUDE.md → AGENT.md`) even when the target is in `.prettierignore`, which would otherwise fail every commit that touches it.

## Scripts (`package.json`)

| Script                    | What it does                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `dev`                     | `vite` dev server                                                |
| `build`                   | `format` → `lint:fix` → `lint` → `tsc -b` → `vite build`         |
| `preview`                 | Serve the production build locally                               |
| `lint` / `lint:fix`       | `eslint .` (with/without `--fix`)                                |
| `format` / `format:check` | `prettier --write` / `--check` over the whole tree               |
| `check-types`             | `tsc -b`                                                         |
| `prepare`                 | Installs Husky's git hooks (runs automatically on `npm install`) |

## CI (`.github/workflows/`)

- **`pull-request.yml`** — on every PR to `main`, one job, one install/build (no duplicate work across separate check/preview workflows): `npm run build` (which itself chains format → lint:fix → lint → tsc -b → vite build, so this single step is the type-check, the lint check, and the build) with `--base=/<repo>/pr-preview/pr-<number>/`, then publishes that build as a live preview via `rossjrw/pr-preview-action` and posts the link into an "App preview" section of the PR description. A failing build/lint/type-check fails the PR and skips the preview. Tears the preview down automatically on PR close.
- **`deploy.yml`** — on push to `main`: builds the app with `--base=/<repo>/` (repo name read from the GitHub context, not hardcoded, since this is a template) and publishes `dist/` to the `gh-pages` branch via `JamesIves/github-pages-deploy-action`. Copies `index.html` to `404.html` in the build output so GitHub Pages serves the app (not a real 404) for react-router deep links.
  - **First-time setup** (not done by the workflow): GitHub Pages must be enabled once in repo Settings → Pages, source "Deploy from a branch" → `gh-pages`, after the first `deploy.yml` run creates that branch.

## Editor tooling

- **`.vscode/mcp_config.json`** — configures the Mantine MCP server (`@mantine/mcp-server`) for editors/agents that support MCP, so component docs/APIs are queryable while prototyping.

## App structure

```
src/
  main.tsx        # Entry point: enableMocking() → MantineProvider → RecursicaThemeProvider → BrowserRouter → App
  App.tsx          # react-router <Routes>, one <Route> per page/prototype
  routes/          # One file per route (e.g. Home.tsx)
    modes.ts       # `Mode` type + `useModes`/`usePrototypeModes` — the
                   #   `?mode=<id>` convention
    ModesPanel.tsx # Slide-out (right) picker UI for a prototype's modes
    Prototype.tsx  # <Prototype> wrapper every prototype renders through —
                   #   always mounts ModesPanel, even with no modes
    prototypes/    # index.ts auto-discovers every <slug>/index.tsx below it
      <slug>/      #   and registers it at /prototypes/<slug> — no manual
        index.tsx  #   route or Home wiring needed to add one
        modes.ts   #   optional: this prototype's `modes: Mode[]`
  data/            # Mock datasets shared across prototypes
    index.ts       # Registry: auto-discovers every <name>/index.ts below
    <name>/        #   a typed, JSDoc'd data array; import it directly
      index.ts     #   from a prototype for full type safety
  api/             # Mock APIs (MSW) shared across prototypes
    index.ts       # Registry: aggregates every <name>/index.ts's handlers
    worker.ts      # setupWorker(...apiHandlers) — started by main.tsx
    <name>/        # index.ts exports `handlers`, typed + JSDoc'd; just
      index.ts     #   add the folder to register a new mock endpoint
  assets/          # Static assets imported by components
  recursica_fonts.css  # Generated font @imports — see src/recursica_fonts.css above
public/            # Static assets served as-is (favicon, icons, mockServiceWorker.js)
docs/
  PROTOTYPE.md     # Process for creating a new prototype — see AGENT.md/README.md
```

Home (`/`) lists every discovered prototype, each self-contained in its own
`src/routes/prototypes/<slug>/` folder so prototypes can't affect each
other — except for the shared `src/data/` and `src/api/` mocks, which any
prototype may use (see Prototype conventions below).

## Prototype conventions

- **Isolation.** No code sharing between prototypes — no shared code or
  folders outside a prototype's own folder, other than the app chrome under
  `src/routes/`, the registry (`src/routes/prototypes/index.ts`), the
  modes convention (`src/routes/modes.ts`, `src/routes/ModesPanel.tsx`,
  `src/routes/Prototype.tsx`), and the shared mock data/API folders below.
  A prototype must not import from or modify another prototype's folder.
- **Mock data & mock APIs are the two deliberate exceptions.** Real
  prototypes need to call something, so `src/data/<name>/` (typed,
  JSDoc'd datasets) and `src/api/<name>/` ([MSW](https://mswjs.io/)
  handlers, typed + JSDoc'd) are shared and reusable across prototypes.
  Both are auto-discovered by their own registry — see the App structure
  tree above. Each dataset/API also exports a `description` string so
  its purpose is discoverable without opening the file.
- **Bad-data and API-error scenarios are first-class, not an afterthought.**
  Every dataset ships bad-data sets alongside the good one (empty, and
  malformed/schema-violating records), and every mock API ships
  error/malformed handlers alongside its default one. See
  `src/data/greetings/` + `src/api/greetings/` for a working example.
- **Every prototype renders through `<Prototype>`** (`src/routes/Prototype.tsx`),
  which always mounts the mode-picker panel — so `?mode`/`?modes` opens it
  even for a prototype with no modes defined, not just ones that opted in.
- **Modes select which mock data/API behavior a prototype uses**, by
  number, via `?mode=<id>` — the generalized, reusable version of swapping
  scenarios in with `worker.use(...)` / back out with
  `worker.resetHandlers()` (`src/api/worker.ts`). A prototype that wants
  modes adds a colocated `modes.ts` (`Mode[]` from `src/routes/modes.ts`),
  passes it as `<Prototype modes={modes}>`, and reads the active one with
  `usePrototypeModes()`. `ModesPanel` (`src/routes/ModesPanel.tsx`) is the
  picker itself, sliding out from the right when the URL asks for it
  (`?mode` with no value, or `?modes`) rather than naming a mode directly.
  See `docs/PROTOTYPE.md` for the designer-facing process and
  `src/routes/prototypes/demo/` for a working example.
- **Everything is routable**, including modals — a modal should be
  routable within its page (e.g. via a search param) so it can be navigated
  back to, shared, or reloaded without being lost.
- **State lives at the page level; components are stateless.** Transitions
  between pages pass state through the URL (path segments and search
  params) rather than global state or storage, so routes stay
  shareable/restorable from the URL alone.
- **Global state, when the URL can't hold enough:** a React context +
  provider that the prototype owns and wraps itself in. There's no
  shared/app-level provider, since prototypes can't know about each other.

See `AGENT.md` for the full rules AI agents follow when working on
prototypes.
