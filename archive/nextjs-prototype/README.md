# Archived: Next.js prototype

This is the original working prototype of INFiLLPK, built as a Next.js 16 + Tailwind v4 app with a
Prisma/SQLite-backed product catalog and admin dashboard. It's kept here as a **design and asset
reference** — it is no longer the production codebase.

**The production site is now a custom WordPress theme** at
[`wp-content/themes/infillpk/`](../../wp-content/themes/infillpk/), using WooCommerce for the
storefront and Elementor for visual page editing. See the root [README.md](../../README.md).

## What's worth reusing from here

- `src/app/globals.css` — the full design token system (colors, spacing, the reasoning behind them)
- `src/components/hero/` — the procedural Three.js/GSAP exploded-printer hero animation, ported to
  the WordPress theme's `assets/js/hero.js`
- `src/lib/data/products.ts` (and `prisma/seed-data.ts`) — the 34-item demo catalog with real
  brand names and specs, used as the source for the WooCommerce product importer
- `src/components/pakistan/` — the interactive Pakistan region map concept
- `src/components/sections/find-your-printer-section.tsx` — the printer-recommendation quiz logic

## Running this prototype (if you ever need to)

```bash
npm install
cp .env.example .env   # set ADMIN_PASSWORD / ADMIN_SESSION_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

It still works standalone — nothing here depends on the WordPress theme, and the WordPress theme
doesn't depend on this running.
