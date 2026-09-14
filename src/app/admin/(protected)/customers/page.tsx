import { getAllCustomers } from "@/lib/data/customers";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Customers</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Everyone who has created an account or placed an order appears here.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-ink">{c.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{c.email}</td>
                <td className="px-4 py-3 text-ink-muted">{c.phone ?? "—"}</td>
                <td className="tabular px-4 py-3 text-ink-muted">{c._count.orders}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
