# Archived: canvas frame-sequence hero

The second attempt at a scroll-driven hero: 45 pre-decoded JPEG frames drawn to `<canvas>` and
indexed by scroll progress (see `archive/hero-video-scene/` for why the video-seeking approach
before this didn't work). The frame-sequence technique itself was correct, but the scroll pacing and
positioning had real bugs (fixed across a couple of iterations), and the whole approach turned out to
be more machinery than the actual requirement needed.

**The production hero is now a simple, non-scroll-driven photo carousel** — see
[`../../src/components/hero/homepage-hero.tsx`](../../src/components/hero/homepage-hero.tsx), which
reuses the existing [`PhotoCarousel`](../../src/components/sections/photo-carousel.tsx) component
(dot navigation, swipeable) with photos an admin picks and reorders from Settings
(`SiteSettings.heroImages`), instead of driving a printer-assembly animation at all. Much less code,
no scroll-math to get right, and CMS-editable without a code change.

The 45 JPEG frames this used (`public/frames/hero-printer/`) were deleted rather than kept here —
they were mid-experiment assets extracted from footage the site owner still has, not something with
lasting reference value once the code explaining the approach exists.
