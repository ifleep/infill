# Archived: video-scrub hero (`currentTime` seeking)

An attempt at the hero animation that scrubbed a compressed H.264 video's `currentTime` against
scroll progress instead of driving a canvas frame sequence. It didn't work well in practice: seeking
a compressed video forces the browser to find the nearest keyframe before the target time and decode
forward from there on every scroll tick, which was janky and heavy on the main thread — especially on
footage with sparse keyframes (typical of phone-exported video), and especially on the slower mobile
connections this site's audience actually uses.

**The production hero now scrubs a JPEG frame sequence on `<canvas>` instead** — see
[`../../public/frames/hero-printer/`](../../public/frames/hero-printer/) and
[`../../src/components/hero/hero-frame-scene.tsx`](../../src/components/hero/hero-frame-scene.tsx).
Each frame is a pre-decoded image drawn directly to canvas, so scrubbing is instant with no per-frame
decode cost — the actual technique the reference prompt that inspired this ("pre-rendered image
sequence scrubbed via scroll on a `<canvas>`") called for from the start. Kept here for reference only;
`archive/hero-printer-model-v1/` and `archive/hero-3d-scene/` hold the earlier procedural-3D attempts
this superseded.
