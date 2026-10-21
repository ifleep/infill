import { getAllCouponsAdmin } from "@/lib/data/coupons-admin";
import { LinkButton } from "@/components/ui/button";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";
import { formatPKR } from "@/lib/format";

function statusFor(c: { active: boolean; expiresAt: Date | null; maxRedemptions: number | null; redemptionCount: number }) {
  if (!c.active) return { label: "Disabled", className: "bg-surface-sunken text-ink-faint" };
  if (c.expiresAt && c.expiresAt.getTime() < Date.now()) {
    return { label: "Expired", className: "bg-amber-50 text-amber-700" };
  }
  if (c.maxRedemptions !== null && c.redemptionCount >= c.maxRedemptions) {
    return { label: "Used up", className: "bg-amber-50 text-amber-700" };
  }
  return { label: "Active", className: "bg-green-50 text-green-700" };
}

export default async function AdminCouponsPage() {
  const coupons = await getAllCouponsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Coupons</h1>
          <p className="mt-1 text-sm text-ink-muted">Discount codes customers can apply at checkout.</p>
        </div>
        <LinkButton href="/admin/coupons/new">Add Coupon</LinkButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Min order</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => {
              const status = statusFor(c);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.discountType === "percent" ? `${c.discountValue}%` : formatPKR(c.discountValue)}
                    {c.discountType === "percent" && c.maxDiscountAmount != null && (
                      <span className="text-ink-faint"> (up to {formatPKR(c.maxDiscountAmount)})</span>
                    )}
                  </td>
                  <td className="tabular px-4 py-3 text-ink-muted">
                    {c.redemptionCount}
                    {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.minOrderAmount != null ? formatPKR(c.minOrderAmount) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.expiresAt ? c.expiresAt.toLocaleDateString("en-PK") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CouponRowActions id={c.id} code={c.code} />
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
