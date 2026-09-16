"use client";

import { useEffect, useState } from "react";

export const FRAME_COUNT = 45;
// Frame files are 1-indexed (frame-001.jpg ... frame-045.jpg).
export const framePath = (i: number) => `/frames/hero-printer/frame-${String(i + 1).padStart(3, "0")}.jpg`;

/**
 * One carousel slide: the printer exploded/assembled, at whatever frame
 * `progress` (0-1, driven by scroll — see HeroCarousel) maps to. Preloads
 * all 45 frames up front so scrubbing never waits on a network request
 * mid-scroll.
 */
export function PrinterAssemblySlide({ progress }: { progress: number }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Array.from({ length: FRAME_COUNT }, (_, i) => {
        const img = new Image();
        img.src = framePath(i);
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    ).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const frame = Math.round(progress * (FRAME_COUNT - 1));

  return (
    <div className="relative h-full w-full shrink-0 overflow-hidden bg-hero-bg">
      {loaded && (
        // eslint-disable-next-line @next/next/no-img-element -- swapped every frame, not a static import
        <img src={framePath(frame)} alt="3D printer assembling" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
