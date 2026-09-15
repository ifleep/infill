# Archived: hero 3D printer model (v1)

The first procedural build of the homepage hero's 3D printer — a boxy enclosure (chassis, 4 panels,
glass door), a bare gantry (2 Z rails, 1 X beam, toolhead, nozzle), a bed, and a handful of external
details (spool holder, status screen, 4 feet). Kept here for reference; **the production hero model
is the more detailed rig now at** [`src/components/hero/printer-parts.ts`](../../src/components/hero/printer-parts.ts)
and [`src/components/hero/printer-rig.tsx`](../../src/components/hero/printer-rig.tsx), which adds
corner trim posts, door hinges/handle, vent slats, a lit logo plate, an interior LED bar, leveling
feet, Z leadscrews/motors, a cable chain, a toolhead fan and heatsink, bed leveling knobs, filament
sensor and a screen bezel/knob — same data-driven part list + scroll-driven assemble/explode rig, just
built from more parts.

Both versions plug into the same [`HeroScene`](../../src/components/hero/hero-scene.tsx) via
`PrinterRig`, and both are superseded automatically if a real `.glb` is ever dropped at
`public/models/printer.glb` (see [`optional-gltf-model.tsx`](../../src/components/hero/optional-gltf-model.tsx)).
