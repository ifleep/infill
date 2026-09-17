import { getAllCategoriesAdmin } from "@/lib/data/categories-admin";
import { LinkButton } from "@/components/ui/button";
import { CategoryRowActions } from "@/components/admin/category-row-actions";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-ink-muted">
            An internal taxonomy you can organize products under — separate from the shop&rsquo;s main sections
            (3D Printers, Filament, Resin, Parts &amp; Accessories, Machines), which stay fixed.
          </p>
        </div>
        <LinkButton href="/admin/categories/new">Add Category</LinkButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-faint">/{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{c.parentName ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{c.productCount}</td>
                <td className="px-4 py-3">
                  <CategoryRowActions id={c.id} name={c.name} />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
