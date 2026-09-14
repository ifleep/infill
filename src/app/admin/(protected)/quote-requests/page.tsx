import { getAllQuoteRequests } from "@/lib/data/quote-requests";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";

export default async function AdminQuoteRequestsPage() {
  const quotes = await getAllQuoteRequests();

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Quote Requests</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Requests from quote-only products and the contact form&rsquo;s &ldquo;Request a quote&rdquo; topic.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3 font-medium text-ink">{q.productName}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {q.name}
                  <br />
                  <span className="tabular">{q.phone}</span>
                  {q.email && <span> · {q.email}</span>}
                </td>
                <td className="max-w-xs px-4 py-3 text-ink-muted">{q.message ?? "—"}</td>
                <td className="px-4 py-3 text-ink-faint">
                  {new Date(q.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <QuoteStatusControl id={q.id} status={q.status} />
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No quote requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
