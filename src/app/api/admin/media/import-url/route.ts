import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { assertSafeExternalUrl, fetchExternal, UnsafeUrlError } from "@/lib/admin/safe-fetch-external";
import { saveImageBytesAsMedia, MediaValidationError, MAX_IMAGE_BYTES } from "@/lib/admin/media-storage";

const MAX_URLS_PER_REQUEST = 40;

function filenameFromUrl(url: URL): string {
  const base = url.pathname.split("/").filter(Boolean).pop();
  return base && base.includes(".") ? decodeURIComponent(base) : "image";
}

// Actually downloads and saves the candidate URLs the admin picked after
// reviewing /api/admin/media/scan-url's results. One bad URL doesn't fail
// the batch — each is attempted independently and reported separately.
export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const urls = Array.isArray(body?.urls) ? body.urls.filter((u: unknown): u is string => typeof u === "string") : [];
  if (urls.length === 0) return NextResponse.json({ error: "No URLs to import." }, { status: 400 });
  if (urls.length > MAX_URLS_PER_REQUEST) {
    return NextResponse.json({ error: `Pick ${MAX_URLS_PER_REQUEST} or fewer at a time.` }, { status: 400 });
  }

  const media = [];
  const errors: { url: string; error: string }[] = [];

  for (const rawUrl of urls) {
    try {
      const url = await assertSafeExternalUrl(rawUrl);
      const res = await fetchExternal(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentLength = Number(res.headers.get("content-length") ?? "0");
      if (contentLength > MAX_IMAGE_BYTES) throw new MediaValidationError("Larger than 8MB.");
      const contentType = res.headers.get("content-type") ?? "";
      const bytes = Buffer.from(await res.arrayBuffer());
      const saved = await saveImageBytesAsMedia(bytes, filenameFromUrl(url), contentType);
      media.push(saved);
    } catch (err) {
      const message =
        err instanceof UnsafeUrlError || err instanceof MediaValidationError ? err.message : "Couldn't import this image.";
      errors.push({ url: rawUrl, error: message });
    }
  }

  return NextResponse.json({ media, errors });
}
