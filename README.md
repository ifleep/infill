# INFiLLPK

Modern 3D printing and digital fabrication technology for Pakistan. Next.js 16 + Tailwind v4, a
MySQL-backed catalog and CMS (Prisma 7), and a password-protected `/admin` dashboard for managing
products, product photos, rich product content, homepage promotions, pages, the INFiLL Lab, and
site settings — all without a code change or redeploy.

> A WordPress + WooCommerce + Elementor version was also explored and is kept at
> [`archive/wordpress-theme/`](archive/wordpress-theme/) in case that direction is revisited — it is
> not the production codebase.

## Local development

```bash
npm install
cp .env.example .env   # set DATABASE_URL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET
npm run db:migrate
npm run dev
```

`db:migrate` needs a running MySQL or MariaDB server reachable at `DATABASE_URL` — for local
development that's usually `mysql://root@127.0.0.1:3306/infillpk` against a MySQL/MariaDB install
on your machine (or a Docker container). Create the empty database first if it doesn't exist yet
(`mysql -e "CREATE DATABASE infillpk"`); `db:migrate` creates the tables inside it. There's no demo
catalog to seed — add your own brands and products from `/admin` once the tables exist.

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin` for the dashboard
(login with the `ADMIN_PASSWORD` you set).

## What's in `/admin`

- **Products** — full catalog CRUD: pricing, stock, availability, featured flag, photos (via the
  Media Library, below), a block-based content editor for the product page body, and SEO fields.
- **Brands** (`/admin/brands`) — name, slug, country, description and logo; this is the live source
  for brand names shown on product cards, filters and search across the site.
- **Categories** (`/admin/categories`) — an internal, parent/child taxonomy you can assign products
  to, separate from the shop's fixed top-level sections (3D Printers, Filament, Resin, Parts &
  Accessories, Machines), which stay hard-coded.
- **Inventory** (`/admin/inventory`) — every product's stock and low-stock threshold in one place,
  with a "low stock only" filter for spotting what needs restocking.
- **Media Library** (`/admin/media`) — every uploaded image in one place, reused across products,
  homepage sections, pages and articles instead of re-uploading. Products/homepage/pages/articles
  all open the same picker to select existing media.
- **Homepage** (`/admin/homepage`) — promotional banners and image sections shown on the homepage
  (between the featured printers and materials sections). The 3D hero, printer finder and Pakistan
  map stay hand-built custom components and aren't editable here, by design.
- **Pages** (`/admin/pages`) — new content pages (e.g. a Warranty Policy) created here are reachable
  at their URL slug automatically. This does not touch the existing hand-built About/Contact/Services
  pages, which keep their own custom design.
- **INFiLL Lab** (`/admin/lab`) — buying guides and articles: featured image, block-based content,
  author, publish status (draft/published/scheduled), SEO.
- **Orders / Customers** — read-only for now. No payment gateway is connected yet (see Known
  limitations below), so these are empty until a real checkout flow is wired up; the schema and
  admin views are ready for that.
- **Settings** — currently just the WhatsApp contact button's number and pre-filled message; more
  can be added to the same `SiteSetting` key-value store later without a migration.

Every admin save calls Next.js's on-demand revalidation, so changes appear on the live site
immediately — **no redeploy needed for content changes** (price/stock/photos/homepage
promos/articles/pages/SEO). A redeploy is only needed for actual code changes.

## Deploying to Hostinger

Hostinger runs Node apps through its **Node.js App Manager** (hPanel → **Advanced → Node.js**),
built on Phusion Passenger. That's different from a plain VPS `npm start` — Passenger requires a
single JS entry file it can start and hand a port to via `process.env.PORT`, which is what
`server.js` at the repo root is for (a thin wrapper around Next's programmatic API — see the comment
in that file). If you're on a **VPS/Cloud plan** with full shell access instead, you can skip
`server.js` and just run `npm run build && npm run start` under `pm2` or a systemd service — use
whichever matches your plan.

### 1. Create the MySQL database

hPanel → **Databases → MySQL Databases** → create a database and a user, and note the hostname,
database name, username and password it gives you (Hostinger's shared MySQL is usually reachable at
`localhost` from the same account's Node app, not a public host). Build the connection string:

```
mysql://<user>:<password>@<host>:3306/<database>
```

### 2. Application settings (hPanel → Advanced → Node.js)

- **Node.js version**: 20 or newer.
- **Application root**: the folder you deployed this repo into.
- **Application startup file**: `server.js`.
- **Application mode**: Production.

### 3. Environment variables

Set these in the same Node.js app settings screen — don't commit real secrets to `.env`:

- `DATABASE_URL` — the MySQL connection string from step 1.
- `ADMIN_PASSWORD` — a strong, unique password for `/admin`.
- `ADMIN_SESSION_SECRET` — random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `NODE_ENV=production`

### 4. Install, migrate, build

Hostinger's Node.js app screen has a "Run NPM Install" button and a terminal/SSH option — either
way, from the app's root run, **in this order**:

```bash
npm install
npm run db:migrate:deploy
npm run build
```

`npm run build` also runs `prisma migrate deploy` automatically first (a `prebuild` hook), so an
automated pipeline that only runs `npm install && npm run build` still won't crash even if the
migrate step above is skipped.

There's no demo catalog — add your own brands and products from `/admin` after the first deploy.

### 5. Start (or restart) the application

From the same hPanel screen, then visit your domain — you should see the homepage — then `/admin`
to confirm login works.

## Image uploads and persistence

Uploaded product/media images are written to `public/uploads/` and served back out through a
dedicated route (`src/app/uploads/[filename]/route.ts`) rather than relying on Next.js's normal
static file serving — Next only serves `public/` files that existed at `next build` time, so a file
uploaded after the build would otherwise 404. This works as long as the deployed app folder persists
across restarts (which it does on Hostinger's Node.js App Manager — it doesn't re-clone into a new
directory each time). If you move to a deploy process that *does* re-clone into a fresh directory
per deploy, uploaded files need to move to external object storage (e.g. S3-compatible storage) —
the Media Library's data model (a `Media.url` string) already supports that without a schema change,
only the upload route itself would need to change where it writes files.

## Known limitations / not yet built

- **Checkout is still a mock** — no payment gateway is connected. The `Order`/`OrderItem`/`Customer`
  schema and admin visibility exist so a real Pakistani payment gateway can be wired in later without
  another migration, but nothing currently creates a real order.
- **Customer accounts don't exist yet** — same reasoning: the schema is ready (`Customer`,
  `CustomerAddress`), but there's no register/login flow, intentionally, rather than a hand-rolled
  insecure one.
- **Admin authentication is a single shared password** (`ADMIN_PASSWORD`), by design — no per-user
  accounts or roles.
