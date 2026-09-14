import { getAllPages } from "@/lib/data/pages";
import { LinkButton } from "@/components/ui/button";
import { PageRowActions } from "@/components/admin/page-row-actions";

export default async function AdminPagesList() {
  const pages = await getAllPages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Pages</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Content pages like About, Warranty or FAQ — reachable at their URL slug automatically. Existing custom
            pages (About, Contact, Services) keep their own design and aren&rsquo;t managed here.
          </p>
        </div>
        <LinkButton href="/admin/pages/new">Add Page</LinkButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                <td className="px-4 py-3 text-ink-muted">/{p.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "published" ? "bg-pk-green/10 text-pk-green" : "bg-surface-sunken text-ink-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PageRowActions id={p.id} title={p.title} />
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No pages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
