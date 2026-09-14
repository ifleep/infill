import { revalidatePath } from "next/cache";

// Called after every admin mutation (products, media, homepage sections,
// pages, articles, …) so content changes show up on the live site without
// a redeploy (requirement #13) — product/category pages, the homepage and
// the sitemap are statically generated (see generateStaticParams on
// src/app/products/[slug]/page.tsx), so without this they'd keep serving
// the build-time snapshot until the next `next build`.
//
// revalidatePath('/', 'layout') purges the whole route tree rather than
// enumerating every page that could depend on the changed data (product
// detail page, homepage featured sections, category listings, sitemap,
// compare, search) — simpler and safer than trying to keep that dependency
// list in sync by hand, at the cost of being broader than strictly
// necessary. See node_modules/next/dist/docs/01-app/03-api-reference/
// 04-functions/revalidatePath.md, "Revalidating all data".
export function revalidateSite() {
  revalidatePath("/", "layout");
}
