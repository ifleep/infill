"use client";

import { useState } from "react";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { MediaPicker } from "@/components/admin/media-picker";

function toImageRef(m: MediaItem): BlockImageRef {
  return { mediaId: m.id, url: m.url, alt: m.alt ?? "", caption: m.caption ?? undefined };
}

/** Reorderable hero-photo list + picker — shared by the desktop and mobile hero-photo sections in Settings. */
export function HeroImagesEditor({
  images,
  onChange,
}: {
  images: BlockImageRef[];
  onChange: (images: BlockImageRef[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={img.mediaId || i} className="flex items-center gap-2 rounded-md border border-border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
          <img src={img.url} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
          <span className="flex-1 truncate text-xs text-ink-muted">{img.alt || img.url}</span>
          <button
            type="button"
            onClick={() => move(i, -1)}
            disabled={i === 0}
            aria-label="Move up"
            className="focus-ring cursor-pointer rounded p-1 text-ink-faint hover:text-ink disabled:opacity-30"
          >
            <CaretUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            disabled={i === images.length - 1}
            aria-label="Move down"
            className="focus-ring cursor-pointer rounded p-1 text-ink-faint hover:text-ink disabled:opacity-30"
          >
            <CaretDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            aria-label="Remove"
            className="focus-ring cursor-pointer rounded p-1 text-ink-faint hover:text-destructive"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="focus-ring cursor-pointer rounded-md border border-dashed border-border-strong px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
      >
        Add photos
      </button>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        onSelect={(items) => {
          const existing = new Set(images.map((i) => i.mediaId));
          const additions = items.filter((i) => !existing.has(i.id)).map(toImageRef);
          onChange([...images, ...additions]);
        }}
      />
    </div>
  );
}
