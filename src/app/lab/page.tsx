import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "@phosphor-icons/react/ssr";
import { getPublishedArticles } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "INFiLL Lab",
  description: "Buying guides, comparisons and material guides for 3D printing and digital fabrication.",
};

const categories = ["All", "Buying Guide", "Comparison", "Materials", "Maintenance", "Technology"] as const;

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && categories.includes(category as (typeof categories)[number]) ? category : "All";

  const articles = await getPublishedArticles();
  const filtered = active === "All" ? articles : articles.filter((a) => a.category === active);

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">INFiLL Lab</h1>
      <p className="mt-2 max-w-xl text-ink-muted">
        Buying guides, comparisons, and material knowledge — so you can make a confident decision
        before you spend a rupee.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/lab" : `/lab?category=${encodeURIComponent(c)}`}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm ${
              active === c
                ? "border-blue-700 bg-blue-50 text-blue-700"
                : "border-border text-ink-muted hover:border-blue-300"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link
            key={a.id}
            href={`/lab/${a.slug}`}
            className="focus-ring group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-blue-300"
          >
            {a.featuredImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
              <img src={a.featuredImageUrl} alt="" className="-mx-6 -mt-6 mb-4 aspect-[16/9] rounded-t-xl object-cover" />
            ) : (
              <BookOpen size={20} className="text-blue-700" />
            )}
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {a.category} · {a.readingMinutes} min read
            </p>
            <h2 className="font-display mt-2 text-lg font-semibold text-ink group-hover:text-blue-700">
              {a.title}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{a.excerpt}</p>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-sm text-ink-faint">No articles yet.</p>}
      </div>
    </div>
  );
}
