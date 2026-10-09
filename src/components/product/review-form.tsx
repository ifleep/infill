"use client";

import { useRef, useState } from "react";
import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const MAX_PHOTOS = 4;

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function addPhotos(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setPhotos((prev) => [...prev, ...newFiles].slice(0, MAX_PHOTOS));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      className="max-w-lg space-y-4 rounded-xl border border-border p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);
        try {
          const formData = new FormData();
          formData.set("rating", String(rating));
          formData.set("authorName", authorName);
          formData.set("title", title);
          formData.set("body", body);
          for (const photo of photos) formData.append("photos", photo);

          const res = await fetch(`/api/products/${productSlug}/reviews`, { method: "POST", body: formData });
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

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Photos (optional)</span>
        {photos.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-md border border-border bg-surface-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element -- local file preview, not a static import */}
                <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  className="focus-ring absolute right-0.5 top-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addPhotos(e.target.files)}
            className="block text-xs text-ink-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-border"
          />
        )}
        <p className="mt-1 text-xs text-ink-faint">Show off your print — up to {MAX_PHOTOS} photos, 8MB each.</p>
      </div>

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
