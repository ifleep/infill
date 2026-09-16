"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockImageRef } from "@/lib/content-blocks/types";

// A real-photos showcase (workshop, printers in use, team, customers) with
// dot navigation underneath — distinct from the static "gallery" variant's
// grid layout. Swipeable on touch, click-to-jump dots, and a slow auto-
// advance that pauses on hover/focus so it doesn't fight someone reading.
export function PhotoCarousel({ images }: { images: BlockImageRef[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % images.length) + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setInterval(() => goTo(index + 1), 5000);
    return () => clearInterval(t);
  }, [index, paused, images.length, goTo]);

  if (images.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="aspect-[16/9] overflow-hidden rounded-2xl bg-surface-sunken sm:aspect-[21/9]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import
            <img
              key={img.mediaId || i}
              src={img.url}
              alt={img.alt}
              className="h-full w-full shrink-0 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.mediaId || i}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`focus-ring h-2 cursor-pointer rounded-full transition-all ${
                i === index ? "w-6 bg-blue-700" : "w-2 bg-border-strong hover:bg-ink-faint"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
