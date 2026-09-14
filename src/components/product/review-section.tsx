import { Star } from "@phosphor-icons/react/ssr";
import { getApprovedReviewsForProduct } from "@/lib/data/reviews";
import { ReviewForm } from "@/components/product/review-form";

export async function ReviewSection({ productId, productSlug }: { productId: string; productSlug: string }) {
  const reviews = await getApprovedReviewsForProduct(productId);

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold text-ink">
        Reviews {reviews.length > 0 && <span className="text-ink-faint">({reviews.length})</span>}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No reviews yet — be the first to share your experience.</p>
      ) : (
        <ul className="mt-4 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} weight={n <= r.rating ? "fill" : "regular"} className="text-amber-600" />
                ))}
              </div>
              {r.title && <p className="mt-1.5 text-sm font-semibold text-ink">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-ink-muted">{r.body}</p>}
              <p className="mt-1.5 text-xs text-ink-faint">
                {r.authorName} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <ReviewForm productSlug={productSlug} />
      </div>
    </div>
  );
}
