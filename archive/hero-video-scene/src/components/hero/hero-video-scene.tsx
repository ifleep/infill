"use client";

import { useEffect, useRef, type RefObject } from "react";

const VIDEO_SRC = "/videos/hero-printer.mp4";

/**
 * Renders the hero's printer-assembly footage and scrubs it frame-by-frame
 * against scroll progress (0-1, written into progressRef by the ScrollTrigger
 * in CinematicHero) instead of letting it play on its own timeline — same
 * "scroll down to assemble, scroll up to explode" feel the old procedural
 * Three.js rig had, just driven by real footage.
 */
export function HeroVideoScene({
  progressRef,
  onReady,
}: {
  progressRef: RefObject<number>;
  onReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Scrubbing takes over entirely — the browser must never advance the
    // video on its own timeline between our currentTime writes.
    video.pause();

    let raf: number;
    const tick = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        const progress = progressRef.current ?? 0;
        video.currentTime = progress * duration;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      onLoadedData={onReady}
      className="h-full w-full object-cover"
      aria-hidden="true"
    />
  );
}
