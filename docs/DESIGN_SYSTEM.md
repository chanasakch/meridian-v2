# Design System

All tokens live in `src/index.css`, defined once under `:root` (light) and `.dark`, and exposed to Tailwind utilities through a `@theme inline` mapping. Every component consumes the same tokens — there is no per-component color override anywhere in the codebase.

## Principles

1. **One brand accent, used deliberately.** The interface is a near-neutral zinc scale; color is reserved for the single brand accent (emerald) and a fixed set of semantic risk colors. No second "loud" color exists for a one-off need — categorical, non-status data (like payer type) renders as a plain neutral chip rather than being assigned an arbitrary color.
2. **Status is never color alone.** Every risk indicator pairs a color with a text label (`High`, `Medium`, `Low`) and, in the schedule table, the numeric probability.
3. **Elevation is a ring, not a shadow, on resting surfaces.** Cards use a 1px inset ring (`ring-1 ring-border`). Shadows are reserved for surfaces that float above content: the sidebar drawer, the patient detail panel, toasts, and the command palette.
4. **Radius derives from one scale.** Two tokens, `--radius-lg` (10px) and `--radius-xl` (14px), drive every rounded corner in the app. Controls use the smaller radius; cards, sheets, and dialogs use the larger one.

## Color tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| `background` | `#ffffff` | `#09090b` | Page background |
| `foreground` | `#18181b` | `#fafafa` | Default text |
| `card` | `#ffffff` | `#18181b` | Card and panel surfaces |
| `muted` | `#f4f4f5` | `#27272a` | Subtle fills — input backgrounds, badge backgrounds |
| `muted-foreground` | `#71717a` | `#a1a1aa` | Secondary and caption text |
| `accent` | `#f4f4f5` | `#27272a` | Hover backgrounds |
| `border` | `rgb(0 0 0 / 8%)` | `rgb(255 255 255 / 10%)` | Card rings and hairlines |
| `brand` | `#059669` | `#10b981` | Primary actions, active nav state, focus ring |
| `brand-foreground` | `#ffffff` | `#052e1a` | Text on brand-filled surfaces |

The brand color is measurably brighter in dark mode (`#10b981` versus `#059669`) to stay legible against a near-black background, which is why its foreground color also flips from white to a dark green rather than staying constant.

### Semantic risk colors

A fixed, named set — never generated dynamically and never reused for anything other than risk level:

| Level | Color | Threshold |
|---|---|---|
| Low | `#10b981` (emerald) | < 30% |
| Medium | `#f59e0b` (amber) | 30–59% |
| High | `#f43f5e` (rose) | ≥ 60% |

## Typography

Inter, loaded as a single font stack with system-font fallbacks. No secondary typeface is used. The scale is Tailwind's default (`text-xs` through `text-2xl`); layout, not font size, is what changes across breakpoints. Numeric values that need column alignment (KPI figures, table cells) use `tabular-nums`.

## Spacing and radius

Tailwind's default 4px-based spacing scale is used unmodified. Page padding steps once at the `sm` breakpoint (`px-4 sm:px-6`), matching the same pattern used for every other responsive adjustment in the app: one deliberate step, not a bespoke jump.

| Radius token | Value | Used by |
|---|---|---|
| `--radius-lg` | 10px | Buttons, inputs, segmented controls |
| `--radius-xl` | 14px | Cards, sheets, the command palette |

## Component patterns

- **Button** — a single component with `variant` (`default`, `outline`, `secondary`, `ghost`, `destructive`) and `size` props, rather than one-off styled buttons. The default variant is brand-filled; destructive is reserved for genuinely destructive actions (none currently exist in the app, since all state changes are additive or reversible).
- **Card** — `rounded-xl` with a 1px ring, no shadow. `CardHeader` provides a consistent title/subtitle/action layout used by every panel.
- **Badge** — two variants: `RiskBadge` (color-coded, always paired with a label) for status, and a plain neutral `Badge` for categorical data like payer type.
- **Sheet** — one primitive drives both the mobile navigation drawer and the patient detail panel, parameterized by which edge it slides from (`side="left"` or `side="right"`). Both use the same animation timing and backdrop treatment.
- **SegmentedControl** — a hand-built pill selector with a Framer Motion `layoutId` indicator that animates between options, used for the date range and sandbox category inputs in place of native `<select>` elements where the option set is small and fixed.
- **Tooltip** — an inverted-color (`bg-foreground` on `text-background`) hover label, used for the collapsed sidebar's icon-only navigation.

## Motion

Framer Motion drives every transition, kept short and functional:

| Surface | Motion | Duration |
|---|---|---|
| Sidebar drawer / patient panel | Slide from the anchored edge, backdrop fade | 200ms |
| Toasts | Fade and scale in/out | Spring, ~250ms effective |
| Command palette | Fade and scale | 100–150ms |
| Segmented control / tab indicator | Position, via shared `layoutId` | Spring |

No decorative or scroll-triggered animation is used anywhere in the app.

## Icons

[lucide-react](https://lucide.dev) exclusively, at two sizes for nearly all usage (16px and 14px). Icons default to `currentColor` so they inherit their container's text color, including the brand-tinted active navigation state.
