import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { imageSize } from "image-size";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

// Every upload becomes a Media Library row (not just a bare file) — this is
// the one place files are written to disk, used by the product photo
// manager, the block content editor, and homepage promotional sections
// alike, so nothing has to re-upload the same image twice (see /admin/media).
//
// Files are saved straight to disk under public/uploads/. Next.js's
// production server only serves public/ files that existed at build time,
// so these are served back out through the dedicated /uploads/[filename]
// route (src/app/uploads/[filename]/route.ts) instead of relying on that —
// see the comment there for why. Same persistence note as the database
// (see README): this needs the app folder itself to persist across
// redeploys, which it does as long as deploys update files in place.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const created: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string | null;
    caption: string | null;
  }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `"${file.name}" isn't a supported image type (use JPEG, PNG, WebP, AVIF or GIF).` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is larger than 8MB — resize it and try again.` },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
    const diskFilename = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, diskFilename), bytes);

    let width: number | null = null;
    let height: number | null = null;
    try {
      const size = imageSize(bytes);
      width = size.width;
      height = size.height;
    } catch {
      // Non-fatal — some valid files (e.g. certain GIFs) can fail dimension
      // sniffing; the upload itself still succeeds without width/height.
    }

    const media = await prisma.media.create({
      data: {
        url: `/uploads/${diskFilename}`,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
      },
    });

    created.push(media);
  }

  return NextResponse.json({ media: created });
}
