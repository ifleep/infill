"use client";

import { useEffect, useState } from "react";

const FRAME_COUNT = 45;
const FPS = 20;
// Frame files are 1-indexed (frame-001.jpg ... frame-045.jpg).
const framePath = (i: number) => `/frames/hero-printer/frame-${String(i + 1).padStart(3, "0")}.jpg`;

/**
 * One carousel slide: the printer assembling from exploded to fully built,
 * played forward once (not scroll-scrubbed — that's what made the earlier
 * attempts feel broken, since seeking a video or jumping around a frame
 * sequence is a different, much heavier operation than just playing frames
 * forward in order). Plays through whenever `active` becomes true, holds on
 * the final assembled frame, and resets back to the exploded frame once the
 * carousel moves to another slide so it's ready to play again next time.
 */
export function PrinterAssemblySlide({ active }: { active: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [frame, setFrame] = useState(0);

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

  useEffect(() => {
    if (!active || !loaded) return;
    let i = 0;
    // Reset to the first frame via a callback (not a direct call in the
    // effect body) so there's no stale frame from the last playthrough
    // visible while waiting for the first setInterval tick.
    const immediate = setTimeout(() => setFrame(0), 0);
    const id = setInterval(() => {
      i += 1;
      if (i >= FRAME_COUNT) {
        setFrame(FRAME_COUNT - 1);
        clearInterval(id);
        return;
      }
      setFrame(i);
    }, 1000 / FPS);
    return () => {
      clearTimeout(immediate);
      clearInterval(id);
    };
  }, [active, loaded]);

  // Not the active slide — show the exploded starting frame so it's ready
  // to play from the beginning next time the carousel comes back around.
  const displayFrame = active ? frame : 0;

  return (
    <div className="relative h-full w-full shrink-0 overflow-hidden bg-hero-bg">
      {loaded && (
        // eslint-disable-next-line @next/next/no-img-element -- swapped every frame, not a static import
        <img src={framePath(displayFrame)} alt="3D printer assembling" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
