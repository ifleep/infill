import Link from "next/link";
import { ArrowRight, BookOpen } from "@phosphor-icons/react/ssr";
import { getPublishedArticles } from "@/lib/data/articles";
import { SectionHeading } from "@/components/ui/section-heading";

export async function LearnSection() {
  const articles = await getPublishedArticles();
  const latest = articles.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className="container-page py-20 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="INFiLL Lab" title="Learn before you buy." />
        <Link
          href="/lab"
          className="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex"
        >
          Visit INFiLL Lab <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {latest.map((a) => (
          <Link
            key={a.id}
            href={`/lab/${a.slug}`}
            className="focus-ring group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-blue-300"
          >
            <BookOpen size={20} className="text-blue-700" />
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {a.category} · {a.readingMinutes} min read
            </p>
            <h3 className="font-display mt-2 text-lg font-semibold text-ink group-hover:text-blue-700">
              {a.title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">{a.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
