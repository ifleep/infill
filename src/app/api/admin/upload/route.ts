import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";

// Product photos are saved straight to disk under public/uploads/ — Next.js
// serves that folder's contents directly at runtime (not just at build
// time), so a file written here is servable immediately, no rebuild needed.
// Same persistence note as the SQLite database (see README): this needs the
// app folder itself to persist across redeploys, which it does as long as
// deploys update files in place rather than doing a fresh clone elsewhere.
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

  const urls: string[] = [];
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
    const filename = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), bytes);
    urls.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ urls });
}
