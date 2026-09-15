import { getSiteSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { isObjectStorageConfigured } from "@/lib/storage";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const hasObjectStorage = isObjectStorageConfigured();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Settings</h1>
      <SettingsForm initial={settings} />

      <div className="mt-8 max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Backups</h2>
          <p className="mt-1 text-sm text-ink-muted">
            A full export of every table (products, orders, customers, reviews — everything) as JSON.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a file download from an API route, not a page transition; next/link doesn't apply */}
        <a
          href="/api/admin/backup"
          className="focus-ring inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Download backup now
        </a>
        <p className="text-xs text-ink-faint">
          For automatic backups, add a cron job (Hostinger hPanel → Advanced → Cron Jobs) that
          requests <code className="rounded bg-surface-sunken px-1 py-0.5">/api/cron/backup?token=YOUR_BACKUP_CRON_SECRET</code>{" "}
          on a schedule. Set <code className="rounded bg-surface-sunken px-1 py-0.5">BACKUP_CRON_SECRET</code> in
          your environment first — see .env.example.{" "}
          {hasObjectStorage
            ? "Object storage is configured, so scheduled backups upload off-server automatically."
            : "Object storage isn't configured yet, so scheduled backups will email themselves to your store notification address instead — set S3_* env vars for a more durable destination (see .env.example)."}
        </p>
      </div>
    </div>
  );
}
