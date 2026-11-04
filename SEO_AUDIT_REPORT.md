# INFiLLPK Technical SEO Audit

**Method note:** This sandbox cannot reach `infillpk.com` over the network (direct `curl` got an explicit proxy policy denial; a second fetch tool got a DNS failure) — the same restriction that's blocked a handful of other external domains all session. This audit is therefore based on a direct read of the Next.js source that generates the live site, not a live crawl. Where that matters, it's called out explicitly below with the exact command to run yourself against the real site. Treat the "needs live verification" items as open, not resolved.

---

## 1. Title tags, H1–H3 hierarchy, meta descriptions

**Title/meta — solid, per-page, not hardcoded.**
- Root layout (`src/app/layout.tsx`) sets a template (`%s | INFiLLPK`) and a real default title/description/OG/Twitter card — not a placeholder.
- Product pages (`src/app/products/[slug]/page.tsx`) override this per product via `generateMetadata`, falling back sensibly: `product.seoTitle || defaultTitle`, `product.metaDescription || product.shortDescription`. Canonical URL and OG title/description also override per product when set.
- **Gap:** `seoTitle`/`metaDescription` are admin-fillable but are *not* included in the catalog Excel export — there's no way to bulk-audit which products currently have these set vs falling back to defaults. You've been setting them manually via the paste tool; there's no dashboard view of coverage.
- **Gap:** no length guard anywhere (admin form or metadata generation) — an overly long `seoTitle`/`metaDescription` will just get truncated in Google's SERP snippet with no warning when it's saved.

**Heading hierarchy — clean.**
- Exactly one `<h1>` on the homepage, split between `homepage-hero.tsx` (desktop) and `mobile-hero.tsx` — mutually exclusive by breakpoint, so never two H1s at once.
- H2/H3 usage is spread sensibly across the homepage's section components (`services-section.tsx`, `learn-section.tsx`, `digital-fabrication-section.tsx`, etc.) rather than concentrated or skipped.

**Needs live verification:**
```bash
curl -s https://infillpk.com/ | grep -oE '<title>.*</title>|<meta name="description"[^>]*>'
curl -s https://infillpk.com/ | grep -oE '<h[1-3][^>]*>.*?</h[1-3]>'
```

---

## 2. Sitemap and broken-link check

`src/app/sitemap.ts` builds `sitemap.xml` dynamically — not a static file that goes stale. It pulls live from the database on every request: visible products (respecting `includeInSitemap`), published CMS pages and articles (respecting `noindex`), categories, and brands with at least one visible product. Static routes (`/about`, `/contact`, `/services`, `/lab`, `/compare`, `/sitemap-page`, `/brands`) are included with sensible priority weights.

This is a real strength — it structurally cannot contain a product that's hidden or out of the catalog, which is a common source of 404s in sitemaps that are built once and forgotten.

**What I can't check from here:** whether any URL *in* that sitemap currently 404s in production (e.g. a product deleted after being indexed, before `sitemap.ts` next regenerates). That needs an actual crawl.

**Run this yourself:**
```bash
curl -s https://infillpk.com/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed -E 's/<\/?loc>//g' > /tmp/urls.txt
while read -r url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  [ "$code" != "200" ] && echo "$code  $url"
done < /tmp/urls.txt
```
Anything printed by that loop is a broken sitemap entry worth investigating.

---

## 3. robots.txt

`src/app/robots.ts` — also dynamic, not a static file:
```
allow: "/"
disallow: ["/cart", "/checkout", "/account", "/wishlist", "/admin", "/api", "/category/*?*"]
sitemap: "https://infillpk.com/sitemap.xml"
```
This is correctly scoped: every private/behavioral route is blocked (cart, checkout, account, wishlist, admin, API), and the one clever bit — `/category/*?*` — blocks Google from crawling the combinatorial explosion of filter/sort/pagination query-string variants on category pages, while leaving the base category pages themselves fully crawlable. Every product is reachable via the sitemap independent of category-page crawling, so nothing is actually lost by blocking those variants. No formatting issues, no accidental full-site block — this file is in good shape.

**Needs live verification** (confirm what's actually served matches this source, i.e. no CDN/host-level override in front of it):
```bash
curl -s https://infillpk.com/robots.txt
```

---

## 4. Core Web Vitals readiness

**Good:**
- Fonts load via `next/font` (Outfit + Inter) in the root layout — this avoids the layout-shift-on-font-swap problem that plain `@font-face`/Google Fonts `<link>` tags cause, and is a real CLS win already in place.
- Google Analytics loads via `next/script` with `strategy="afterInteractive"` — non-blocking, won't delay first paint.
- Images sit inside fixed-aspect-ratio CSS containers (e.g. `aspect-square` on product images, fixed-height flex containers on the hero carousel) rather than relying on explicit HTML `width`/`height` — this does prevent layout shift even without those attributes, so CLS risk here is lower than the missing attributes alone would suggest.
- Loading strategy is already hand-tuned in several places: the hero carousel's first slide and a product's primary image load `eager`, everything else `lazy`, with `decoding="async"` set throughout.

**The one real, significant gap: `next/image` is used nowhere in the public-facing site.**
```
grep -rl "from \"next/image\"" src/components/product src/components/category src/components/hero
→ 0 matches
```
Every public image — homepage hero, carousels, product gallery, category cards — is a raw `<img>` tag. This is clearly a deliberate choice, not an oversight: every instance carries an explicit `eslint-disable-next-line @next/next/no-img-element` comment with the same reasoning ("uploaded files, not a static import"), and `next.config.ts` has no `images.remotePatterns` configured at all — meaning `next/image` was never wired up to trust your S3/R2 image host in the first place, so raw `<img>` was the only option without that config change.

What this costs you: no automatic responsive `srcset` (a phone likely downloads the same full-resolution image as a desktop), no automatic modern-format serving (WebP/AVIF) unless your storage layer does that itself, and no automatic blur-up placeholder. For a catalog site where the hero image and the product's primary photo are very likely each page's Largest Contentful Paint element, this is the single highest-leverage Core Web Vitals fix available — and it's a config change plus a swap of the `<img>` tag for `<Image>` in a handful of files, not a rebuild.

**Needs live verification** (actual field/lab CWV numbers, not just static readiness):
```bash
# Needs a Google PageSpeed Insights API key, or just run this URL manually:
# https://pagespeed.web.dev/analysis?url=https://infillpk.com
```

---

## 5. AI Overviews / GEO (Answer Engine) readiness

This is the strongest area of the whole audit — better than most sites this size. Structured data in `src/app/products/[slug]/page.tsx` includes `Product`, `AggregateOffer`/`Offer`, `AggregateRating`, `BreadcrumbList`, `MerchantReturnPolicy`, and `OfferShippingDetails` — a genuinely thorough schema.org implementation, not just a bare `Product` stub. `src/components/product/faq.tsx` adds a separate `FAQPage` schema with explicit `Question`/`acceptedAnswer` pairs, and the root layout adds site-level `Organization` schema.

This matters directly for AI Overviews/answer engines: they lean heavily on exactly this kind of explicit, machine-readable fact structure (price, availability, rating, return policy, shipping time, Q&A pairs) rather than parsing prose. Few sites at this scale bother with shipping/return-policy schema specifically — that's a real differentiator here.

**Where it's weaker:** this structured data is only as good as what's actually filled in per product. Given the content-quality work done earlier this session (fixing thin descriptions, em-dashes, leaked internal notes across many products), the schema *mechanism* is strong but its *inputs* — short/full description quality, whether `FAQPage` entries exist per product or only on some — are inconsistent across the catalog, matching the content-debt issues already identified and partially fixed earlier. The code can't fix that; it's a per-product content task, same category as the photo/variant work already underway.

---

## 6. Prioritized task list

**High priority — real, verified issues:**
- [ ] Add `images.remotePatterns` to `next.config.ts` for your R2/S3 host, then migrate the hero, carousel, and product-gallery `<img>` tags to `next/image`. Highest-leverage Core Web Vitals fix available; likely the LCP element on every major page.
- [ ] Run the sitemap broken-link check above and fix/remove any URL that 404s.
- [ ] Add a soft character-count warning in the admin product form for `seoTitle` (~60 chars) and `metaDescription` (~155-160 chars) so an overlong one doesn't silently get truncated in search results.

**Medium priority — process gaps, not code bugs:**
- [ ] Add `SEO Title` and `Meta Description` columns to the catalog Excel export so you can actually see which products have these set vs falling back to defaults, instead of having no visibility at all (flagged earlier this session too).
- [ ] Confirm `FAQPage` schema entries exist consistently across products that should have them, not just some.

**Low priority / verify-only — likely fine, confirm against the live site:**
- [ ] Run the live `curl` checks in sections 1–3 above once network access allows it, to confirm the deployed site matches this source (no CDN-layer override of robots.txt, no stale cached titles).
- [ ] Run an actual PageSpeed Insights pass for real Core Web Vitals field/lab data, since static readiness (this report) isn't the same as measured performance.

**Not an issue — no action needed:**
- Heading hierarchy, robots.txt rules, sitemap generation logic, font loading strategy, analytics script loading strategy, and structured-data coverage are all already in good shape and don't need rework.
