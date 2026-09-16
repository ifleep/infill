"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { HeroFrameScene } from "@/components/hero/hero-frame-scene";
import { HeroStaticVisual } from "@/components/hero/hero-static";
import { LinkButton } from "@/components/ui/button";

type Variant = "cinematic" | "static";

function subscribeToHeroCapability(onChange: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getHeroVariantSnapshot(): Variant {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.innerWidth < 768;
  return reducedMotion || isSmallScreen ? "static" : "cinematic";
}

function getHeroVariantServerSnapshot(): Variant {
  return "static";
}

function useHeroVariant(): Variant {
  return useSyncExternalStore(subscribeToHeroCapability, getHeroVariantSnapshot, getHeroVariantServerSnapshot);
}

export function CinematicHero() {
  const variant = useHeroVariant();
  const [framesReady, setFramesReady] = useState(false);
  const progressRef = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "cinematic") return;
    let ctx: { revert: () => void } | undefined;
    let mounted = true;

    import("gsap").then(async ({ gsap }) => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!mounted || !wrapperRef.current || !pinRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinRef.current,
          pinSpacing: false,
          scrub: 0.4,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
      });
    });

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, [variant]);

  const isCinematic = variant === "cinematic";

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: isCinematic ? "280vh" : undefined }}
    >
      <div ref={pinRef} className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {isCinematic && (
            <HeroFrameScene progressRef={progressRef} onReady={() => setFramesReady(true)} />
          )}
          {(!isCinematic || !framesReady) && <HeroStaticVisual />}
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

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center text-on-navy-muted">
          <CaretDown size={20} className="animate-bounce" aria-hidden="true" />
          <span className="sr-only">Scroll to explore</span>
        </div>
      </div>
    </div>
  );
}
