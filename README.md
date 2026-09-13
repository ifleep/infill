# INFiLLPK

Modern 3D printing and digital fabrication technology for Pakistan — a Next.js storefront covering
3D printers, materials, parts and digital fabrication equipment, plus services and an educational
content hub (INFiLL Lab).

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first theme in `src/app/globals.css`)
- Three.js / React Three Fiber + GSAP ScrollTrigger for the homepage hero
- Zustand for cart/compare client state (persisted to `localStorage`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app` — routes (App Router)
- `src/components` — UI, organized by domain (`hero/`, `cart/`, `product/`, `sections/`, …)
- `src/lib/data` — mock product/brand/article catalog (demo data; see note below)
- `src/lib/types.ts` — shared data model

## Notes on the current state

- **Catalog data is a demo dataset**: real printer/filament/machine brands with their genuine public
  specs, but placeholder pricing and stock — not a live inventory feed. See `src/lib/data/products.ts`.
- **Product imagery** is procedurally generated (no real product photos yet) via
  `src/components/product/product-visual.tsx`.
- **Checkout, accounts, and search** run on mock/local state — there's no backend, payment
  provider, or database wired up yet. Cash on Delivery / Bank Transfer are the only checkout
  options; JazzCash/Easypaisa are shown disabled as a placeholder for future integration.
- **Contact details, WhatsApp number, and legal pages** are placeholders pending the real business
  information — each is labeled as such in the UI.
- **Hero 3D printer**: a procedurally built, code-generated model (no external 3D asset). If a real
  glTF/GLB model is placed at `public/models/printer.glb`, the hero automatically uses it instead —
  see `src/components/hero/optional-gltf-model.tsx`.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
