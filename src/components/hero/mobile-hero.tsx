"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { framePath, FRAME_COUNT } from "@/components/hero/printer-assembly-slide";
import type { BlockImageRef } from "@/lib/content-blocks/types";

type Slide = { kind: "printer" } | { kind: "image"; image: BlockImageRef };

/**
 * Phone-only hero (rendered instead of HomepageHero below the `sm`
 * breakpoint — see HomepageHero). The desktop hero's 200vh scroll-jacked
 * sticky panel and 45-frame preload is a known source of broken-looking
 * carousels on mobile browsers (dynamic viewport-height changes as the
 * address bar shows/hides fight the sticky math, and preloading 45 full
 * JPEGs is heavy on a mobile connection). This is a plain fixed-aspect-
 * ratio swipeable carousel instead: no scroll-jacking, no sticky
 * positioning, no viewport-height units, and a single static "assembled
 * printer" frame rather than the animation.
 */
export function MobileHero({ heroImages }: { heroImages: BlockImageRef[] }) {
  const slides: Slide[] = [{ kind: "printer" }, ...heroImages.map((image) => ({ kind: "image" as const, image }))];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(id);
  }, [index, slides.length, goTo]);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-hero-bg-deep">
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
            slide.kind === "printer" ? (
              // eslint-disable-next-line @next/next/no-img-element -- a single static frame, not user content
              <img
                key="printer"
                src={framePath(FRAME_COUNT - 1)}
                alt="3D printer"
                className="h-full w-full shrink-0 object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import
              <img
                key={slide.image.mediaId || i}
                src={slide.image.url}
                alt={slide.image.alt}
                className="h-full w-full shrink-0 object-cover"
                loading="lazy"
                decoding="async"
              />
            )
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-hero-bg-deep/85 via-hero-bg-deep/20 to-transparent" />

      <div className="container-page pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-6">
        <h1 className="font-display text-3xl font-semibold leading-[1.05] tracking-tight text-on-navy">
          Build what&rsquo;s next.
        </h1>
        <p className="mt-3 max-w-xs text-sm text-on-navy-muted">
          3D printing technology, materials and digital fabrication for Pakistan.
        </p>
        <div className="pointer-events-auto mt-4 flex flex-wrap gap-2.5">
          <LinkButton href="/category/3d-printers" size="md">
            Shop 3D Printers
          </LinkButton>
          <LinkButton href="/about" variant="outline-invert" size="md">
            Explore Technology
          </LinkButton>
        </div>

        {slides.length > 1 && (
          <div className="pointer-events-auto mt-4 flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.kind === "printer" ? "printer" : slide.image.mediaId || i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  i === index ? "w-5 bg-blue-700" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
