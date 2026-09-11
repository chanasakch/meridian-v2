# Meridian v2 — Sidebar Design-System Redesign

A design-language exploration of the No-Show Intelligence app (the sibling
`../` project), rebuilt around patterns reverse-engineered from a separate
reference product's `SYSTEM_DESIGN.md`: a neutral, single-accent color system,
ring-based elevation, a persistent collapsible sidebar shell, and a ⌘K
command palette.

**This is a parallel fork, not a replacement.** The original project at `../`
is untouched — same functionality, own dependencies, own dev server.

## What changed vs. the original

All product logic — the `computeRiskBreakdown` scoring engine, the synthetic
dataset generator, the SHAP-style attribution math, every calculation — is
copied over **unchanged**. Only the presentation layer was rebuilt:

| Area | Original | This version |
|---|---|---|
| Navigation | Horizontal tab bar | Persistent collapsible sidebar (desktop) → slide-in drawer (mobile) |
| Color | Zinc neutral + emerald *and* indigo accents | Zinc neutral + **exactly one** brand accent (emerald); indigo dropped — payer tags are now a plain neutral chip, not a second "loud" color |
| Card elevation | Border + subtle shadow | 1px ring only (`ring-1 ring-border`), no shadow — shadows reserved for floating surfaces (sheets, dropdowns, toasts, command palette) |
| Radius | Ad-hoc per component | Two tokens (`--radius-lg` 10px, `--radius-xl` 14px), everything derives from them |
| Discovery | None | ⌘K / Ctrl+K command palette — jump to a page or search-and-open a patient's explainability panel directly |
| Sliders | Per-instance accent color | Single brand-accent fill, everywhere |

## Why a sidebar shell

The reference doc's core layout argument: on desktop, a persistent
icon+label sidebar (collapsible) scales better than a tab bar once an app
has enough surface area, and it gives the header room to breathe (global
search/command palette + date range + export + theme, instead of also
carrying navigation). On mobile it becomes a full slide-in drawer rather
than being squeezed into an overflow menu — a real *recomposition*, not a
shrunk desktop bar.

## A bug this redesign surfaced (worth knowing if you extend this)

Wrapping the whole app shell in a top-level `flex` row (sidebar + content
column) reintroduces a classic CSS Grid/Flexbox gotcha: a flex item's
default `min-width` is `auto`, which resolves to the **largest min-content
width of any descendant** — including the patient table's `min-w-[760px]`,
several levels deep, even though that table already has its own
`overflow-x-auto` wrapper. The table's internal scroll containment gets
silently overridden, and the entire right-hand column refuses to shrink
below ~760px, blowing out mobile layouts. Fixed with one class:
`min-w-0` on the flex-1 content column (`src/App.tsx`). If you add another
top-level flex/grid wrapper around page content, add `min-w-0` (or
`minmax(0,1fr)` for a grid track) to it too — this class of bug only shows
up once something wide enough exists deeper in the tree.

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
```

Runs on the same default Vite port as the original — don't run both dev
servers at once (or pass `--port` to one of them).

```bash
npm run build
npm run preview
```

## Stack

Identical to the original: React 19 + TypeScript + Vite, Tailwind CSS v4
(CSS-first config, tokens in `src/index.css`), Framer Motion, Recharts,
lucide-react. No new dependencies were introduced for the redesign itself —
the sidebar, sheets, and command palette are hand-built, matching the
reference doc's own preference for small hand-built primitives over adding
a component library.
