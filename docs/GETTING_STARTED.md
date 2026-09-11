# Getting Started

## Prerequisites

- Node.js 20 or later
- npm 10 or later (bundled with Node)

No database, API keys, or environment variables are required. The application has no backend.

## Install

```bash
npm install
```

## Run in development

```bash
npm run dev
```

Starts a Vite dev server at `http://localhost:5173` with hot module replacement. Pass a different port if 5173 is already in use:

```bash
npm run dev -- --port 5174
```

## Type-check and build

```bash
npm run build
```

Runs `tsc -b` in strict mode, then produces a static production bundle in `dist/`. The build fails on any type error — there is no separate lint-only CI step to catch what the compiler already enforces.

## Preview the production build

```bash
npm run preview
```

Serves the contents of `dist/` locally, exactly as a static host would. Use this to verify the production build before deploying, not the dev server.

## Lint

```bash
npm run lint
```

Runs [oxlint](https://oxc.rs) against the project.

## Deployment

The build output in `dist/` is a static site: HTML, CSS, and JS with no server-side requirement. Any static host works.

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Deploy. No environment variables are needed.

### Netlify

1. New site from Git, select this repository.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy.

Both platforms auto-detect this configuration from `package.json`; the steps above only matter if auto-detection is disabled.

## npm scripts reference

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |
