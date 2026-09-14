"use client";

import { useRef, useState } from "react";

/**
 * Multi-image uploader for the product form. Files upload immediately on
 * selection (POST /api/admin/upload) — the returned URLs are what actually
 * get saved with the product when the form itself is submitted.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    for (const file of Array.from(fileList)) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange([...images, ...data.urls]);
    } catch {
      setError("Network error while uploading — please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
            <div key={src} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-sunken">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="focus-ring absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                &times;
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
        className="block text-sm text-ink-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
      />
      {uploading && <p className="mt-1.5 text-xs text-ink-muted">Uploading…</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <p className="mt-1.5 text-xs text-ink-faint">
        JPEG, PNG, WebP, AVIF or GIF, up to 8MB each. The first image is used as the main photo.
      </p>
    </div>
  );
}
