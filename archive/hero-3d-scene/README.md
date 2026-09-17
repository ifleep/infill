# Archived: procedural Three.js hero scene

The homepage hero originally used a scroll-scrubbed Three.js scene — a procedurally-built 3D printer
(see [`hero-printer-model-v1/`](../hero-printer-model-v1/) for the first, plainer version, and the
`printer-parts.ts`/`printer-rig.tsx` here for the more detailed rebuild that replaced it) that
assembled/exploded as the visitor scrolled, plus a dormant `optional-gltf-model.tsx` path that would
swap in a real `.glb` if one were ever dropped at `public/models/printer.glb`.

**The production hero is now a real scroll-scrubbed video** (`public/videos/hero-printer.mp4`, wired
up in [`../../src/components/hero/cinematic-hero.tsx`](../../src/components/hero/cinematic-hero.tsx))
— actual footage of the printer assembling, scrubbed via `video.currentTime` against scroll progress
instead of driving a procedural 3D rig. Kept here for reference in case the procedural approach is
revisited (e.g. for a product configurator or an interactive 3D view elsewhere on the site). The
`three`, `@react-three/fiber` and `@react-three/drei` packages this code depends on were removed from
`package.json` since nothing in the live app imports them anymore — reinstall them if this is revived.
