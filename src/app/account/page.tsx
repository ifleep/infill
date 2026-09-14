import type { Metadata } from "next";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { getCustomerById, getCustomerAddresses, getCustomerOrders } from "@/lib/data/customers";
import { formatPKR } from "@/lib/format";
import { AccountAuth } from "./account-auth";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const customerId = await getCurrentCustomerId();
  if (!customerId) return <AccountAuth />;

  const customer = await getCustomerById(customerId);
  if (!customer) return <AccountAuth />;

  const [addresses, orders] = await Promise.all([getCustomerAddresses(customerId), getCustomerOrders(customerId)]);

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Hi, {customer.name ?? customer.email}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{customer.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Order history</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">You haven&rsquo;t placed any orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{o.orderNumber}</p>
                    <p className="text-xs text-ink-faint">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}{" "}
                      · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-medium text-ink">{formatPKR(o.total)}</p>
                    <p className="text-xs capitalize text-ink-faint">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No saved addresses yet — they&rsquo;ll appear here after checkout.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="rounded-xl border border-border p-4 text-sm">
                  {a.label && <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">{a.label}</p>}
                  <p className="text-ink">{a.fullName}</p>
                  <p className="text-ink-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}
                    {a.province ? `, ${a.province}` : ""}
                  </p>
                  <p className="text-ink-muted">{a.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
