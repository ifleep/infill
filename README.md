# INFiLLPK

Modern 3D printing and digital fabrication technology for Pakistan — a Next.js storefront covering
3D printers, materials, parts and digital fabrication equipment, plus services and an educational
content hub (INFiLL Lab).

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first theme in `src/app/globals.css`)
- Three.js / React Three Fiber + GSAP ScrollTrigger for the homepage hero
- Zustand for cart/compare client state (persisted to `localStorage`)
- **Prisma + SQLite** for the product catalog, with a password-protected `/admin` dashboard

## Getting started

```bash
npm install          # also runs `prisma generate` via postinstall
cp .env.example .env # then edit ADMIN_PASSWORD / ADMIN_SESSION_SECRET
npm run db:migrate   # creates data/app.db and applies the schema
npm run db:seed      # loads the demo catalog (34 products)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront, or
[http://localhost:3000/admin](http://localhost:3000/admin) to manage products (log in with the
`ADMIN_PASSWORD` you set in `.env`).

## Managing the catalog (`/admin`)

- **Dashboard** (`/admin`) — every product in a table; price, sale price, stock count, and
  availability (In stock / Out of stock / Preorder) save automatically as you edit them. Toggle
  "Featured" to control what shows in the homepage's Featured section.
- **Add / edit** (`/admin/products/new`, pencil icon on a row) — full form for name, brand,
  category, description, etc.
- **Delete** — trash icon on a row (asks for confirmation).
- Sale pricing: set a "Sale price" lower than the regular price and the storefront automatically
  shows a strikethrough regular price and a "Sale" badge on the product card.
- Brands are managed in code (`src/lib/data/brands.ts`), not in `/admin` — they change rarely. Ask
  for a new brand to be added if you need one that isn't listed yet.

Access is a single shared password (`ADMIN_PASSWORD`), not individual accounts — treat it like a
shared door key and change it if someone who shouldn't have access might know it.

## Project structure

- `src/app` — routes (App Router), including `admin/` (dashboard) and `api/admin/` (CRUD endpoints)
- `src/components` — UI, organized by domain (`hero/`, `cart/`, `product/`, `admin/`, …)
- `src/lib/data` — data-access layer; `products.ts` queries the database, everything else
  (brands, categories, articles, services, Pakistan regions) is still static code
- `src/lib/db.ts` — Prisma client singleton; `src/lib/admin-auth.ts` — session cookie auth
- `prisma/schema.prisma` — database schema; `prisma/seed.ts` + `prisma/seed-data.ts` — demo catalog
- `src/lib/types.ts` — shared data model

## Notes on the current state

- **Catalog data is a demo dataset**: real printer/filament/machine brands with their genuine public
  specs, but placeholder pricing and stock — not a live inventory feed. Fully editable via `/admin`.
- **Product imagery** is procedurally generated (no real product photos yet) via
  `src/components/product/product-visual.tsx`.
- **Checkout and accounts** run on mock/local state — there's no payment provider wired up yet. Cash
  on Delivery / Bank Transfer are the only checkout options; JazzCash/Easypaisa are shown disabled
  as a placeholder for future integration.
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
- `npm run db:migrate` — create/apply a new migration (local dev, when you change `schema.prisma`)
- `npm run db:migrate:deploy` — apply existing migrations without prompting (use in production)
- `npm run db:seed` — (re)load the demo catalog — **overwrites any product with a matching ID**, so
  don't run this against a production database with real edits you want to keep
- `npm run db:studio` — Prisma Studio, a GUI for browsing/editing the database directly

## Deploying to Hostinger

Required environment variables (set these in Hostinger's Node.js app panel, not just locally):

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin`. Set a strong, unique value. |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DATABASE_URL` | Only read by the Prisma CLI (`migrate`/`seed`), not by the running app. Leave as `file:./data/app.db` unless you've changed the schema's datasource. |

First deploy (after Hostinger installs dependencies and before/around starting the app — via SSH if
available, or a build/deploy hook):

```bash
npm run db:migrate:deploy   # create data/app.db and apply the schema
npm run db:seed             # only on a brand-new database — loads the starting catalog
npm run build
npm run start
```

On every deploy after that, skip `db:seed` (it would overwrite catalog edits made through `/admin`)
— just run `db:migrate:deploy` (a no-op if there's nothing new to apply) and rebuild.

### Important: verify the database file survives redeploys

The catalog lives in a single SQLite file, `data/app.db`, inside the project folder. This works
great as long as that file persists between app restarts and redeploys. Some hosting setups
(especially "upload and auto-deploy" flows) recreate the app directory from scratch on every
deploy, which would silently reset the catalog to empty/re-seeded each time.

**To check:** edit a product's price in `/admin`, trigger a redeploy (or just restart the app from
hPanel), then reload the storefront. If the price change is still there, you're fine. If it reverted,
the filesystem isn't persistent and you have two options:

1. Ask Hostinger support how to designate `data/` as persistent storage outside the deploy
   pipeline (exact steps depend on your plan), or
2. Switch the database to Hostinger's bundled MySQL (nearly every Hostinger hosting plan includes
   at least one) — this is a real database service independent of the app's filesystem, so it
   survives redeploys unconditionally. The codebase uses Prisma with a swappable driver adapter
   specifically so this migration is a scoped change (new adapter package, a schema/config update,
   and re-running migrations against MySQL) rather than a rewrite — ask for this to be done if
   option 1 isn't available on your plan.
