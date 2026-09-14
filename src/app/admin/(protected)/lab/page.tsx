import { getAllArticles } from "@/lib/data/articles";
import { LinkButton } from "@/components/ui/button";
import { ArticleRowActions } from "@/components/admin/article-row-actions";

export default async function AdminLabPage() {
  const articles = await getAllArticles();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">INFiLL Lab</h1>
          <p className="mt-1 text-sm text-ink-muted">Buying guides, comparisons and material knowledge articles.</p>
        </div>
        <LinkButton href="/admin/lab/new">Add Article</LinkButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-ink">{a.title}</td>
                <td className="px-4 py-3 text-ink-muted">{a.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === "published" ? "bg-pk-green/10 text-pk-green" : "bg-surface-sunken text-ink-muted"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-ink-muted">{a.publishedAt}</td>
                <td className="px-4 py-3">
                  <ArticleRowActions id={a.id} title={a.title} />
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
