"use client";

import { useState } from "react";
import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (result?.ok) {
    return <p className="rounded-md bg-pk-green-tint px-4 py-3 text-sm text-pk-green-deep">{result.message}</p>;
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Write a Review
      </Button>
    );
  }

  return (
    <form
      className="max-w-lg space-y-4 rounded-xl border border-border p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);
        try {
          const res = await fetch(`/api/products/${productSlug}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, authorName, title, body }),
          });
          const data = await res.json();
          if (!res.ok) {
            setResult({ ok: false, message: data.error ?? "Something went wrong." });
            return;
          }
          setResult({ ok: true, message: data.message });
        } catch {
          setResult({ ok: false, message: "Couldn't reach the server. Try again." });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {result && !result.ok && <p className="text-sm text-destructive">{result.message}</p>}

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Your rating</span>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              className="focus-ring cursor-pointer p-0.5"
            >
              <Star size={22} weight={(hoverRating || rating) >= n ? "fill" : "regular"} className="text-amber-600" />
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Your name</span>
        <input
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Title (optional)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Review</span>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
        />
      </label>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
