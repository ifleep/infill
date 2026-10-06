import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { assertSafeExternalUrl, fetchExternal, UnsafeUrlError } from "@/lib/admin/safe-fetch-external";
import { extractPageImages } from "@/lib/admin/extract-page-images";

const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a product page's markup

// Given a link, returns candidate image URLs to import — either the link
// itself (if it's already a direct image) or every image found on the page
// (if it's an HTML page, e.g. a manufacturer's product page). Doesn't
// download or save anything yet — see /api/admin/media/import-url for the
// step that actually imports the ones the admin picks.
export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  if (!rawUrl) return NextResponse.json({ error: "Enter a URL." }, { status: 400 });

  let url: URL;
  try {
    url = await assertSafeExternalUrl(rawUrl);
  } catch (err) {
    const message = err instanceof UnsafeUrlError ? err.message : "Couldn't reach that URL.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetchExternal(url);
  } catch {
    return NextResponse.json({ error: "Couldn't reach that URL — check the link and try again." }, { status: 400 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: `That page returned an error (HTTP ${res.status}).` }, { status: 400 });
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.startsWith("image/")) {
    return NextResponse.json({ candidates: [url.toString()] });
  }

  if (!contentType.includes("text/html")) {
    return NextResponse.json(
      { error: "That link isn't an image or a web page — paste a direct image link or a product page URL." },
      { status: 400 }
    );
  }

  const reader = res.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Couldn't read that page." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const html = Buffer.concat(chunks).toString("utf8");

  const candidates = extractPageImages(html, url);
  if (candidates.length === 0) {
    return NextResponse.json({ error: "No images found on that page." }, { status: 400 });
  }

  return NextResponse.json({ candidates });
}
