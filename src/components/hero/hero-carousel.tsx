"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import { PrinterAssemblySlide } from "@/components/hero/printer-assembly-slide";

type Slide = { kind: "animation" } | { kind: "image"; image: BlockImageRef };

/**
 * The hero's full-bleed carousel — same dot-nav/swipe/autoplay behavior as
 * the general PhotoCarousel, but with one fixed slide (the printer
 * assembly animation) mixed in ahead of the admin-managed photos, which
 * PhotoCarousel's plain BlockImageRef[] contract has no way to express.
 */
export function HeroCarousel({ photos }: { photos: BlockImageRef[] }) {
  const slides: Slide[] = [{ kind: "animation" }, ...photos.map((image) => ({ kind: "image" as const, image }))];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(t);
  }, [index, paused, slides.length, goTo]);

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="h-full w-full overflow-hidden"
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
          {slides.map((slide, i) =>
            slide.kind === "animation" ? (
              <PrinterAssemblySlide key="animation" active={index === i} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import
              <img
                key={slide.image.mediaId || i}
                src={slide.image.url}
                alt={slide.image.alt}
                className="h-full w-full shrink-0 object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            )
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.kind === "animation" ? "animation" : slide.image.mediaId || i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`focus-ring h-2 cursor-pointer rounded-full transition-all ${
                i === index ? "w-6 bg-blue-700" : "w-2 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
