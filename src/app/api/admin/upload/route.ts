import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { saveImageBytesAsMedia, MediaValidationError } from "@/lib/admin/media-storage";

// Every upload becomes a Media Library row (not just a bare file) — this is
// the one place files are written to storage, used by the product photo
// manager, the block content editor, and homepage promotional sections
// alike, so nothing has to re-upload the same image twice (see /admin/media).
// See src/lib/admin/media-storage.ts for the validation/storage/dimension-
// sniffing logic itself, shared with the "import from a link" feature.
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

  const created = [];
  for (const file of files) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      created.push(await saveImageBytesAsMedia(bytes, file.name, file.type));
    } catch (err) {
      const message = err instanceof MediaValidationError ? err.message : "Upload failed.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ media: created });
}
