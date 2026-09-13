import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/data/articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/lab/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
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

      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {article.category} · {article.readingMinutes} min read
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-ink-muted">{article.excerpt}</p>

      <div className="prose mt-8 space-y-4">
        {article.body.map((para, i) => (
          <p key={i} className="text-ink-muted">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/lab" className="focus-ring text-sm font-medium text-blue-700 hover:text-blue-600">
          ← Back to INFiLL Lab
        </Link>
      </div>
    </article>
  );
}
