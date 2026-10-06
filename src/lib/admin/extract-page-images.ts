// Pulls candidate image URLs out of a product page's raw HTML — regex-based
// rather than a full DOM parse (no HTML-parsing dependency in this project,
// and a full parse is overkill just to collect src/srcset/og:image values).
// Deliberately permissive: better to show the admin a few extra thumbnails
// to skip over than to silently miss the actual product photos.

const FILENAME_NOISE = /(logo|icon|sprite|favicon|spinner|loading|placeholder|avatar|blank|pixel|spacer|1x1)/i;

function resolve(src: string, pageUrl: URL): string | null {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  try {
    return new URL(trimmed, pageUrl).toString();
  } catch {
    return null;
  }
}

function largestFromSrcset(srcset: string): string | null {
  // "url1 100w, url2 400w, url3 800w" — take the entry with the largest
  // descriptor (width or density), falling back to the last one listed.
  const entries = srcset
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const [url, descriptor] = e.split(/\s+/, 2);
      const n = descriptor ? parseFloat(descriptor) : 0;
      return { url, n: Number.isFinite(n) ? n : 0 };
    });
  if (entries.length === 0) return null;
  entries.sort((a, b) => b.n - a.n);
  return entries[0].url;
}

export function extractPageImages(html: string, pageUrl: URL, limit = 40): string[] {
  const found = new Set<string>();

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const srcset = tag.match(/\bsrcset\s*=\s*["']([^"']+)["']/i)?.[1];
    const dataSrc = tag.match(/\bdata-src\s*=\s*["']([^"']+)["']/i)?.[1];
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const raw = (srcset && largestFromSrcset(srcset)) || dataSrc || src;
    if (!raw) continue;
    const resolved = resolve(raw, pageUrl);
    if (resolved) found.add(resolved);
  }

  for (const m of html.matchAll(/<meta\s+[^>]*property\s*=\s*["']og:image["'][^>]*>/gi)) {
    const content = m[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    if (content) {
      const resolved = resolve(content, pageUrl);
      if (resolved) found.add(resolved);
    }
  }

  for (const m of html.matchAll(/<link\s+[^>]*rel\s*=\s*["']image_src["'][^>]*>/gi)) {
    const href = m[0].match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) {
      const resolved = resolve(href, pageUrl);
      if (resolved) found.add(resolved);
    }
  }

  return Array.from(found)
    .filter((url) => !FILENAME_NOISE.test(url))
    .slice(0, limit);
}
