"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/lib/admin/media-types";
import { MediaPicker } from "@/components/admin/media-picker";

/**
 * Product photo manager. New files upload immediately on selection
 * (POST /api/admin/upload), which creates a Media Library row — existing
 * photos can also be added via "Choose from Library" instead of
 * re-uploading. The ordered list of Media ids is what actually gets saved
 * with the product when the form is submitted (first = primary photo).
 */
export function ImageUploader({
  items,
  onChange,
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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
      const uploaded: MediaItem[] = data.media ?? [];
      onChange([...items, ...uploaded]);
    } catch {
      setError("Network error while uploading — please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addFromLibrary(picked: MediaItem[]) {
    const existingIds = new Set(items.map((i) => i.id));
    const additions = picked.filter((p) => !existingIds.has(p.id));
    if (additions.length > 0) onChange([...items, ...additions]);
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {items.map((item, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-sunken"
            >
              <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
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

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
          className="block text-sm text-ink-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="focus-ring cursor-pointer whitespace-nowrap rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          Choose from Library
        </button>
      </div>
      {uploading && <p className="mt-1.5 text-xs text-ink-muted">Uploading…</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <p className="mt-1.5 text-xs text-ink-faint">
        JPEG, PNG, WebP, AVIF or GIF, up to 8MB each. The first image is used as the main photo.
      </p>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addFromLibrary} multiple />
    </div>
  );
}
