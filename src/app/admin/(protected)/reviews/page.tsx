import Link from "next/link";
import { getAllReviewsAdmin } from "@/lib/data/reviews";
import { ReviewStatusControl } from "@/components/admin/review-status-control";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsAdmin();

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Reviews</h1>
      <p className="mb-6 text-sm text-ink-muted">
        New reviews start pending — approve one to have it appear on the product page and count toward its rating.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <Link href={`/products/${r.product.slug}`} target="_blank" className="focus-ring font-medium text-blue-700 hover:text-blue-600">
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{r.authorName}</td>
                <td className="tabular px-4 py-3 text-ink-muted">{r.rating} / 5</td>
                <td className="max-w-xs px-4 py-3 text-ink-muted">
                  {r.title && <p className="font-medium text-ink">{r.title}</p>}
                  <p className="line-clamp-2">{r.body}</p>
                  {r.photos.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.photos.map((photo) => (
                        <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="focus-ring block">
                          {/* eslint-disable-next-line @next/next/no-img-element -- customer-uploaded, not a static import */}
                          <img
                            src={photo.url}
                            alt="Review photo"
                            className="h-10 w-10 rounded border border-border object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ReviewStatusControl id={r.id} status={r.status} />
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
