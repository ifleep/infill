import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublishedPageBySlug } from "@/lib/data/pages";
import { getRedirectTarget } from "@/lib/data/redirects";
import { ContentRenderer } from "@/components/content-blocks/content-renderer";

// Admin-created content pages (About/Warranty/FAQ/etc. — requirement #10)
// land here at their slug automatically. Existing hand-built routes with a
// matching folder (src/app/about, /contact, /services, ...) always win —
// Next.js resolves a literal path segment before a dynamic one — so this
// never overrides a custom page.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return {};
  const title = page.seoTitle || page.title;
  const description = page.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: page.canonicalUrl || `/${page.slug}` },
    robots: page.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: page.ogTitle || title,
      description: page.ogDescription || description,
    },
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    const target = await getRedirectTarget(`/${slug}`);
    if (target) redirect(target);
    notFound();
  }

  return (
    <div className="container-page py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{page.title}</h1>
      <div className="mt-8">
        <ContentRenderer blocks={page.contentBlocks} />
      </div>
    </div>
  );
}
