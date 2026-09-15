import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Object storage for uploaded media (and, separately, database backups —
// see src/lib/backup.ts). Uses any S3-compatible provider (Cloudflare R2,
// Backblaze B2, DigitalOcean Spaces, AWS S3 itself) when configured via env
// vars, since that's durable storage that survives redeploys/migrations.
// Falls back to today's local-disk behavior (public/uploads/) when not
// configured, so the site keeps working out of the box either way — see
// the S3_* vars in .env.example for what to set to turn this on.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function s3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicUrlBase = process.env.S3_PUBLIC_URL_BASE;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicUrlBase) return null;
  return { endpoint, bucket, accessKeyId, secretAccessKey, publicUrlBase, region: process.env.S3_REGION || "auto" };
}

export function isObjectStorageConfigured(): boolean {
  return s3Config() !== null;
}

let cachedClient: S3Client | null = null;
function getClient(config: NonNullable<ReturnType<typeof s3Config>>): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return cachedClient;
}

/**
 * Stores a file under `key` (e.g. "uploads/abc123.jpg" or "backups/2026-.json")
 * and returns the URL it's reachable at. Uses S3-compatible storage when
 * configured, otherwise writes to public/uploads/ and returns the app's own
 * /uploads/[filename] route path (key's basename only — that route only
 * serves flat filenames, matching its existing path-traversal guard).
 */
export async function storeFile(key: string, bytes: Buffer, contentType: string): Promise<string> {
  const config = s3Config();
  if (config) {
    const client = getClient(config);
    await client.send(
      new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: bytes, ContentType: contentType })
    );
    return `${config.publicUrlBase.replace(/\/$/, "")}/${key}`;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = path.basename(key);
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

/** Local-disk-only read, used by the /uploads/[filename] serving route (S3-backed files are served directly by the provider's URL, not through the app). */
export async function readLocalUpload(filename: string): Promise<Buffer> {
  return readFile(path.join(UPLOAD_DIR, filename));
}
