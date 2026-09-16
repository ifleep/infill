"use client";

import { useEffect, useRef } from "react";
import { LinkButton } from "@/components/ui/button";
import { HeroCarousel } from "@/components/hero/hero-carousel";
import type { SiteSettings } from "@/lib/data/settings";

/**
 * Full-viewport hero — heading/CTA overlaid on a carousel whose first slide
 * is the printer exploded/assembled animation, driven by scroll progress
 * (scroll down to assemble, scroll up to explode) via the same sticky-pin
 * mechanic verified in archive/hero-frame-sequence/. The carousel's other
 * slides are admin-managed photos, reachable via the dots at any time —
 * but scrolling always takes back control of the printer slide, so the two
 * interactions never fight for more than a moment (see HeroCarousel).
 */
export function HomepageHero({ heroImages }: { heroImages: SiteSettings["heroImages"] }) {
  const progressRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Plain scroll-progress math, no library: progress is read straight
    // from live geometry every frame, so it can't latch onto a stale
    // measurement. The wrapper is exactly 2 screen heights tall and the
    // visual sits in a `sticky` inner div, so "scrollable distance while
    // pinned" is always exactly one screen height.
    let raf: number;
    const tick = () => {
      const rect = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      progressRef.current = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen min-h-[560px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <HeroCarousel photos={heroImages} progressRef={progressRef} />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-hero-bg-deep/70 to-hero-bg-deep/5" />

        <div className="container-page relative z-10 flex h-full items-center pointer-events-none">
          <div className="max-w-xl pointer-events-auto">
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-on-navy sm:text-6xl lg:text-7xl">
              Build what&rsquo;s next.
            </h1>
            <p className="mt-5 max-w-md text-lg text-on-navy-muted">
              3D printing technology, materials and digital fabrication for Pakistan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/category/3d-printers" size="lg">
                Shop 3D Printers
              </LinkButton>
              <LinkButton href="/about" variant="outline-invert" size="lg">
                Explore Technology
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
