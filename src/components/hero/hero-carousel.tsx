"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import { PrinterAssemblySlide } from "@/components/hero/printer-assembly-slide";

type Slide = { kind: "animation" } | { kind: "image"; image: BlockImageRef };

const PROGRESS_EPSILON = 0.002;

/**
 * The hero's full-bleed carousel. Slide 0 is the printer assembly, driven
 * live by scroll progress (0-1, written into progressRef by HomepageHero's
 * sticky-pin scroll math) rather than an internal timer — scroll down to
 * assemble, scroll up to explode, exactly like the last verified-working
 * version. The rest are the admin's photos from Settings.
 *
 * Dots let you jump to a photo at any time, but scrolling always takes
 * back control of slide 0: any detected scroll movement snaps back to the
 * live scroll-progress view. That's deliberate — trying to let a manually
 * picked photo coexist with an active scroll gesture is exactly the kind
 * of two-interactions-fighting-each-other bug earlier attempts at this
 * hero ran into, so scroll simply always wins.
 */
export function HeroCarousel({ photos, progressRef }: { photos: BlockImageRef[]; progressRef: RefObject<number> }) {
  const slides: Slide[] = [{ kind: "animation" }, ...photos.map((image) => ({ kind: "image" as const, image }))];
  const [index, setIndex] = useState(0);
  const [printerProgress, setPrinterProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const progress = progressRef.current ?? 0;
      if (Math.abs(progress - lastProgressRef.current) > PROGRESS_EPSILON) {
        lastProgressRef.current = progress;
        setPrinterProgress(progress);
        setIndex(0); // scrolling always reclaims the printer slide
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  // Auto-advance through the slides, same as a normal carousel — scrolling
  // still overrides this instantly (the tick above forces index back to 0
  // on any real scroll movement), so this only matters while the visitor
  // isn't actively scrolling.
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  function goTo(i: number) {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }

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
              <PrinterAssemblySlide key="animation" progress={printerProgress} />
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
