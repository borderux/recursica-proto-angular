# Creating a new prototype

This is the process to follow — designer conversation first, then code —
when someone asks for a new prototype. For the file mechanics (what to
create, how routing/discovery works), see AGENT.md's "How to add a
prototype"; this document is about what to ask before writing any of it.

## 1. Name it

Ask for (or propose) a short, kebab-case name. It becomes both the
prototype's folder and its URL: `src/app/prototypes/<name>/` →
`/prototypes/<name>`.

## 2. Understand the UX

Get the designer's description of what they're prototyping: the flow, the
screens/states involved, and what it needs to demonstrate.

## 3. Ask about data and APIs

Essential questions for every prototype — don't skip these:

- **What mock data does it need?** What shape, roughly how many records,
  which fields matter to the UX being shown.
- **What APIs (if any) does it call?** What each one returns on success.
- **Check what already exists before proposing something new.** List the
  `data/` and `api/` folders (every entry exports a `description`, so this
  is quick) and reuse a dataset/API instead of duplicating a shape that's
  already there.
- **Mention related existing prototypes**, if any — worth a look before
  building something similar from scratch.

## 4. Ask about stories

Ask whether the designer wants to see this prototype in more than one
state — different data, or different API behavior (success, empty, error,
slow). If so, each state becomes a **story** — see below.

## 5. Build it

Create the prototype's page per AGENT.md's mechanical steps, using the
data/API entries from step 3 and the stories from step 4.

## Stories

A **story** is a named, numbered variant of a prototype: it selects which
mock data and/or which mock API behavior the prototype uses while
rendering — the success case, an empty result, an API error, a different
dataset entirely. Stories let a designer flip between "what does this look
like with data", "what does this look like empty", "what does this look
like when the API fails", without a separate prototype for each.

### Structure

A prototype that has stories adds one file to its own folder:

```
src/app/prototypes/<name>/
  index.ts    # page component
  stories.ts  # this prototype's story definitions
```

`stories.ts` exports a `stories: Story[]` array (`Story` from the shared
stories module), each entry with:

- `id` — a number; this is what `?story=<id>` switches on.
- `name` — short label shown in the story picker.
- `description` — from the designer, in plain language: what this story
  does differently (which data, which API behavior).

```ts
import type { Story } from "../../stories";

export const stories: Story[] = [
  { id: 1, name: "Default", description: "Loads normally with sample data." },
  { id: 2, name: "Empty", description: "No records — shows the empty state." },
  { id: 3, name: "API error", description: "The API call fails with a 500." },
];
```

The prototype's page passes these to the shared prototype wrapper, which
every prototype's page renders through, and reads the active one from
inside via the shared stories service. The prototype itself decides what
each story number actually does — which dataset, which handler set — the
same way it already owns everything else about its own page.

A prototype with no stories still renders through the shared wrapper (just
without a stories list) — that's what makes the picker panel open via
`?story`/`?stories` for every prototype, not only ones that define stories.

### URL convention

- `?story=1` — selects story `1` directly. Always numeric, so a specific
  story is a plain, shareable link.
- `?story` (no value) or `?stories` (any value, or none) — opens the story
  picker panel instead of selecting a story.
- No `story` param, or one that doesn't match a known id — falls back to
  the first story in the array.

### The picker panel

The story picker slides out from the side, listing every story by name and
description. Clicking one sets `?story=<id>`, closes the panel, and
re-renders the prototype in that story.

For a complete working example of stories in practice, see any existing
prototype in this repo whose folder includes a `stories.ts`.
