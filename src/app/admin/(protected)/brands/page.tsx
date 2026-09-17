import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { LinkButton } from "@/components/ui/button";
import { BrandRowActions } from "@/components/admin/brand-row-actions";

export default async function AdminBrandsPage() {
  const brands = await getAllBrandsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Brands</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Every brand shown on product cards, filters and search. Changes here appear on the site right away.
          </p>
        </div>
        <LinkButton href="/admin/brands/new">Add Brand</LinkButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {brands.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {b.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- uploaded file, not a static import
                      <img src={b.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
                    ) : (
                      <div className="h-8 w-8 shrink-0 rounded bg-surface-sunken" />
                    )}
                    <div>
                      <p className="font-medium text-ink">{b.name}</p>
                      <p className="text-xs text-ink-faint">/{b.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{b.country || "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{b.productCount}</td>
                <td className="px-4 py-3">
                  <BrandRowActions id={b.id} name={b.name} />
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No brands yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
