import { randomUUID } from "node:crypto";
import path from "node:path";
import { imageSize } from "image-size";
import { prisma } from "@/lib/db";
import { storeFile } from "@/lib/storage";
import type { MediaItem } from "@/lib/admin/media-types";

// Shared by /api/admin/upload (browser file picker), /api/admin/media/
// import-url (fetched from a manufacturer link), and review photo
// submission — same validation, same storage call, so none of these paths
// can quietly drift apart on what counts as a valid image.
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

export class MediaValidationError extends Error {}

/** Validates and writes image bytes to storage — no database row. Used directly by anything that doesn't want a Media Library entry (see ReviewPhoto, which cascade-deletes with its review instead). */
export async function validateAndStoreImage(
  bytes: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; width: number | null; height: number | null }> {
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new MediaValidationError(`"${filename}" isn't a supported image type (use JPEG, PNG, WebP, AVIF or GIF).`);
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new MediaValidationError(`"${filename}" is larger than 8MB — resize it and try again.`);
  }

  const ext = path.extname(filename) || `.${mimeType.split("/")[1]}`;
  const storedFilename = `${randomUUID()}${ext}`;
  const url = await storeFile(`uploads/${storedFilename}`, bytes, mimeType);

  let width: number | null = null;
  let height: number | null = null;
  try {
    const size = imageSize(bytes);
    width = size.width;
    height = size.height;
  } catch {
    // Non-fatal — some valid files can fail dimension sniffing.
  }

  return { url, width, height };
}

/** Saves already-downloaded image bytes as a new Media Library row — validates type/size, writes to storage, sniffs dimensions. */
export async function saveImageBytesAsMedia(
  bytes: Buffer,
  filename: string,
  mimeType: string
): Promise<MediaItem> {
  const { url, width, height } = await validateAndStoreImage(bytes, filename, mimeType);
  return prisma.media.create({
    data: { url, filename, mimeType, size: bytes.byteLength, width, height },
  });
}
