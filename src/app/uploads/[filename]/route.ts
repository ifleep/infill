import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Next.js's production server only serves files under public/ that existed
// at build time — it builds a static manifest at `next build` and doesn't
// re-check the filesystem for new files added afterward, so uploaded photos
// (written to public/uploads/ at runtime, see /api/admin/upload) 404 if
// served the normal public/ way. This route handler reads the file from
// disk on every request instead, so newly uploaded files are servable
// immediately without a rebuild.
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Reject anything that isn't a plain filename (no path traversal).
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
