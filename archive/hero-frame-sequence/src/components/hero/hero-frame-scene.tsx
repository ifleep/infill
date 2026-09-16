"use client";

import { useEffect, useRef, type RefObject } from "react";

const FRAME_COUNT = 45;
const INITIAL_BATCH = 12;
// Frame files are 1-indexed (frame-001.jpg ... frame-045.jpg).
const framePath = (i: number) => `/frames/hero-printer/frame-${String(i + 1).padStart(3, "0")}.jpg`;

type Frame = ImageBitmap | HTMLImageElement;

async function loadFrame(index: number): Promise<Frame> {
  const src = framePath(index);
  if (typeof createImageBitmap === "function") {
    const res = await fetch(src);
    const blob = await res.blob();
    // Decodes off the main thread — the whole point of using createImageBitmap
    // over a plain <img>, since we're loading dozens of these back to back.
    return createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function frameSize(frame: Frame) {
  return frame instanceof ImageBitmap
    ? { width: frame.width, height: frame.height }
    : { width: frame.naturalWidth, height: frame.naturalHeight };
}

/**
 * Renders the hero's printer-assembly frame sequence on a canvas and scrubs
 * it against scroll progress (0-1, written into progressRef by the
 * ScrollTrigger in CinematicHero) — same "scroll down to assemble, scroll up
 * to explode" feel, but drawing pre-decoded frames instead of seeking a
 * compressed video, so there's no per-frame decode cost while scrubbing.
 */
export function HeroFrameScene({
  progressRef,
  onReady,
}: {
  progressRef: RefObject<number>;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(Frame | undefined)[]>(new Array(FRAME_COUNT));
  const loadedUpToRef = useRef(0);
  const currentFrameIndexRef = useRef(-1);

  useEffect(() => {
    let cancelled = false;

    const draw = (index: number) => {
      const canvas = canvasRef.current;
      const frame = framesRef.current[index];
      if (!canvas || !frame) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
      }

      // object-fit: cover — scale the frame to fill the canvas, cropping
      // whichever axis overflows, instead of letterboxing or stretching.
      const { width: fw, height: fh } = frameSize(frame);
      const canvasRatio = canvas.width / canvas.height;
      const frameRatio = fw / fh;
      let sx = 0, sy = 0, sw = fw, sh = fh;
      if (frameRatio > canvasRatio) {
        sw = fh * canvasRatio;
        sx = (fw - sw) / 2;
      } else {
        sh = fw / canvasRatio;
        sy = (fh - sh) / 2;
      }
      ctx.drawImage(frame, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };

    // Load the first batch blocking (so there's something to reveal), then
    // stream the rest in behind the scenes — a visitor on a slow connection
    // waits on ~1-2MB, not the whole sequence, before the hero appears.
    (async () => {
      for (let i = 0; i < Math.min(INITIAL_BATCH, FRAME_COUNT); i++) {
        framesRef.current[i] = await loadFrame(i);
        if (cancelled) return;
        loadedUpToRef.current = i + 1;
      }
      draw(0);
      onReady?.();

      for (let i = INITIAL_BATCH; i < FRAME_COUNT; i++) {
        framesRef.current[i] = await loadFrame(i);
        if (cancelled) return;
        loadedUpToRef.current = i + 1;
      }
    })();

    let raf: number;
    const tick = () => {
      const loadedUpTo = loadedUpToRef.current;
      if (loadedUpTo > 0) {
        const progress = progressRef.current ?? 0;
        const target = Math.round(progress * (FRAME_COUNT - 1));
        // Scrolling ahead of what's loaded so far just holds the last
        // available frame rather than skipping to a blank one.
        const index = Math.min(target, loadedUpTo - 1);
        if (index !== currentFrameIndexRef.current) {
          currentFrameIndexRef.current = index;
          draw(index);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const handleResize = () => {
      if (currentFrameIndexRef.current >= 0) draw(currentFrameIndexRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- progressRef/onReady are stable across the component's lifetime
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
