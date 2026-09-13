# INFiLLPK

Modern 3D printing and digital fabrication technology for Pakistan. Next.js 16 + Tailwind v4, with a
Prisma/SQLite-backed product catalog and a password-protected `/admin` dashboard for managing
products, pricing, sales, and stock/availability.

> A WordPress + WooCommerce + Elementor version was also explored and is kept at
> [`archive/wordpress-theme/`](archive/wordpress-theme/) in case that direction is revisited — it is
> not the production codebase.

## Local development

```bash
npm install
cp .env.example .env   # set ADMIN_PASSWORD / ADMIN_SESSION_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin` for the dashboard
(login with the `ADMIN_PASSWORD` you set).

## Deploying to Hostinger

Hostinger runs Node apps through its **Node.js App Manager** (hPanel → **Advanced → Node.js**),
built on Phusion Passenger. That's different from a plain VPS `npm start` — Passenger requires a
single JS entry file it can start and hand a port to via `process.env.PORT`, which is what
`server.js` at the repo root is for (a thin wrapper around Next's programmatic API — see the comment
in that file). If you're on a **VPS/Cloud plan** with full shell access instead, you can skip
`server.js` and just run `npm run build && npm run start` under `pm2` or a systemd service — use
whichever matches your plan.

### Steps (shared/Business hosting, Node.js App Manager)

1. **Push this repo to GitHub** (if not already) and connect it in hPanel → **Advanced → Node.js** →
   **Create Application**, or upload the files via File Manager/SFTP if you'd rather not connect Git.
2. **Application settings:**
   - **Node.js version**: 20 or newer.
   - **Application root**: the folder you deployed this repo into.
   - **Application startup file**: `server.js`.
   - **Application mode**: Production.
3. **Environment variables** (in the same Node.js app settings screen — don't commit real secrets to
   `.env`):
   - `ADMIN_PASSWORD` — a strong, unique password for `/admin`.
   - `ADMIN_SESSION_SECRET` — random string. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `DATABASE_URL` — `file:./data/app.db` (only read by the Prisma CLI for migrate/seed; the running
     app talks to that same file directly via `src/lib/db.ts`).
   - `NODE_ENV=production`
4. **Install, migrate, seed, build:** Hostinger's Node.js app screen has an "Run NPM Install" button
   and a terminal/SSH option — either way, from the app's root run, **in this order**:
   ```bash
   npm install
   npm run db:migrate:deploy
   npm run db:seed        # first deploy only — reseeds/upserts the demo catalog
   npm run build
   ```
   `npm run build` also runs `prisma migrate deploy` automatically first (a `prebuild` hook), so an
   automated pipeline that only runs `npm install && npm run build` still won't crash — but running
   `db:seed` before `build` is still worth doing manually so the product pages are pre-rendered with
   real data instead of generated empty and filled in on first visit.
5. **Start (or restart) the application** from the same hPanel screen.
6. Visit your domain — you should see the homepage — then `/admin` to confirm login works.

### A real risk worth knowing about: `better-sqlite3`

This project uses `better-sqlite3`, a native (compiled) module, via Prisma's driver adapter. `npm
install` needs to compile it **on the server itself** (matching Hostinger's exact Node version/OS) —
never `npm install` locally and upload `node_modules`, that will fail at runtime with an ABI
mismatch. If `npm install` errors while building `better-sqlite3` specifically, that usually means
the plan's Node.js environment is missing build tools; contact Hostinger support or ask about
Node.js version compatibility for native modules on your plan.

### SQLite persistence — the thing to plan around

`data/app.db` lives on disk right in the app folder — normal file edits and redeploys that update
files in place (git pull, SFTP upload) leave it untouched, so your catalog/admin edits persist across
deploys exactly like any other file on the server. The one thing that *would* wipe it: any deploy
process that does a **fresh clone into a new directory** each time (some CI/CD "auto-deploy from
GitHub" setups work this way). If you're using one of those:

- Either point it at a data directory *outside* the freshly-cloned folder (set `DATABASE_URL` to an
  absolute path outside the repo, e.g. `file:/home/<user>/data/app.db`, and update `src/lib/db.ts` to
  match), or
- Migrate to a real MySQL database instead (Hostinger gives you one free with every hosting plan —
  hPanel → **Databases → MySQL Databases**). This needs a small Prisma change: swap the
  `@prisma/adapter-better-sqlite3` driver adapter for `@prisma/adapter-mariadb` (or plain
  `provider = "mysql"` in `prisma/schema.prisma` without a driver adapter), point `DATABASE_URL` at
  the MySQL credentials Hostinger gives you, then `npm run db:migrate:deploy`. Ask me to make this
  change if you want to go this route — it's a bounded, well-defined swap.

For a single-admin small catalog site, plain file-based SQLite (the default here) is genuinely fine
and simpler — only move to MySQL if you hit the redeploy-wipes-the-folder scenario above or outgrow
single-file SQLite's concurrency limits.
