import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug, getPublishedArticles } from "@/lib/data/articles";
import { ContentRenderer } from "@/components/content-blocks/content-renderer";

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};
  const title = article.seoTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || `/lab/${article.slug}` },
    robots: article.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      images: article.featuredImageUrl ? [{ url: article.featuredImageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
  };

  return (
    <article className="container-page max-w-2xl py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-faint">
        <Link href="/lab" className="focus-ring hover:text-ink">
          INFiLL Lab
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{article.title}</span>
      </nav>

      {article.featuredImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
        <img src={article.featuredImageUrl} alt="" className="mb-8 aspect-[16/9] w-full rounded-xl object-cover" />
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {article.category} · {article.readingMinutes} min read
        {article.author ? ` · ${article.author}` : ""}
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-ink-muted">{article.excerpt}</p>

      <div className="prose mt-8">
        <ContentRenderer blocks={article.contentBlocks} />
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/lab" className="focus-ring text-sm font-medium text-blue-700 hover:text-blue-600">
          ← Back to INFiLL Lab
        </Link>
      </div>
    </article>
  );
}
