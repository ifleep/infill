import { prisma } from "@/lib/db";
import { storeFile, isObjectStorageConfigured } from "@/lib/storage";
import { sendEmail } from "@/lib/notifications/email";
import { getSiteSettings } from "@/lib/data/settings";

// A full logical backup of every table, as plain JSON — not a mysqldump.
// Chosen over shelling out to `mysqldump` because Hostinger's Node hosting
// doesn't guarantee shell/binary access, while this only needs Prisma
// (already the app's only way of talking to the database). Restoring from
// it means writing the rows back with prisma.<model>.createMany() per
// table, in the same dependency order used here (parents before the
// children that reference them).
const TABLES = [
  "brand",
  "category",
  "product",
  "productMedia",
  "productReview",
  "media",
  "page",
  "article",
  "homepageSection",
  "customer",
  "customerAddress",
  "order",
  "orderItem",
  "adminUser",
  "siteSetting",
  "redirect",
  "quoteRequest",
] as const;

export interface BackupResult {
  filename: string;
  json: string;
  sizeBytes: number;
}

export async function createDatabaseBackup(): Promise<BackupResult> {
  const data: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    const model = prisma[table as keyof typeof prisma] as { findMany: () => Promise<unknown[]> };
    data[table] = await model.findMany();
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `infillpk-backup-${timestamp}.json`;
  const json = JSON.stringify({ createdAt: new Date().toISOString(), tables: data }, null, 2);

  return { filename, json, sizeBytes: Buffer.byteLength(json) };
}

const MAX_EMAIL_ATTACHMENT_BYTES = 8 * 1024 * 1024; // Resend's attachment limit is ~40MB, but keep well under it

/**
 * Runs a backup and gets it somewhere off-server: uploads to S3-compatible
 * storage if configured, else emails it as an attachment if Resend and a
 * notification address are configured, else just returns it unsent — a
 * same-server-only backup isn't a real safety net, so this always prefers
 * an off-server destination when one is available.
 */
export async function runAndDeliverBackup(): Promise<{ delivered: "storage" | "email" | "none"; result: BackupResult }> {
  const result = await createDatabaseBackup();
  const bytes = Buffer.from(result.json, "utf8");

  if (isObjectStorageConfigured()) {
    await storeFile(`backups/${result.filename}`, bytes, "application/json");
    return { delivered: "storage", result };
  }

  const settings = await getSiteSettings();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (settings.storeNotificationEmail && apiKey && from && bytes.byteLength <= MAX_EMAIL_ATTACHMENT_BYTES) {
    await sendEmail(
      settings.storeNotificationEmail,
      `INFiLLPK database backup — ${result.filename}`,
      `<p>Automated database backup attached (${(bytes.byteLength / 1024).toFixed(0)} KB). Store it somewhere safe.</p>`,
      [{ filename: result.filename, content: bytes }]
    );
    return { delivered: "email", result };
  }

  return { delivered: "none", result };
}
