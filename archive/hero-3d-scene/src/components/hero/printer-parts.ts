export type PartGeometry =
  | { kind: "box"; args: [number, number, number] }
  | { kind: "cylinder"; args: [number, number, number, number] } // radiusTop, radiusBottom, height, segments
  | { kind: "cone"; args: [number, number, number] }; // radius, height, segments

export interface PrinterPart {
  id: string;
  label: string;
  geometry: PartGeometry;
  color: string;
  metalness?: number;
  roughness?: number;
  /** Final, assembled local position. */
  restPosition: [number, number, number];
  /** Final, assembled local rotation (radians). */
  restRotation?: [number, number, number];
  /** Offset added to restPosition at explode progress = 0. */
  explodeOffset: [number, number, number];
  /** Extra tumble rotation applied at explode progress = 0. */
  explodeRotation?: [number, number, number];
  /** Rides with the gantry during the phase-5 idle sweep. */
  ridesGantry?: boolean;
  /** Order (0-1) within the assembly phase — lets parts settle in a staggered wave. */
  settleOrder?: number;
  /** Opacity once fully assembled (default 1) — used for the glass front door. */
  finalOpacity?: number;
  /** Constant self-illumination, e.g. the status screen. */
  emissive?: string;
  emissiveIntensity?: number;
}

// An original enclosed-printer design (own proportions/details, not a
// reproduction of any specific real product) — a boxy CoreXY-style
// enclosure with visible corner trim, a hinged glass front door, an
// internal gantry with motors/leadscrews/cable management, and the small
// mechanical "greebling" (vents, leveling feet, a lit logo plate, an
// interior LED bar) that reads as a real machine up close rather than a
// handful of flat panels. See archive/hero-printer-model-v1/ for the
// earlier, plainer version this replaced.
const white = "#e7e9ec";
const chassisDark = "#1b1e23";
const glassTint = "#8fb3e6";
const metal = "#8b929c";
const metalDark = "#3a3f48";
const blueAccent = "#1f3f8a";
const brass = "#b8863b";
const cream = "#efe9df";
const black = "#111318";
const screenGlow = "#8fd7ff";
const ledWhite = "#f5f8ff";

export const printerParts: PrinterPart[] = [
  // ---- Enclosure ----
  { id: "base-chassis", label: "Base chassis", geometry: { kind: "box", args: [2.6, 0.4, 2.6] }, color: chassisDark, metalness: 0.3, roughness: 0.55, restPosition: [0, 0.2, 0], explodeOffset: [0, -2.0, 0], explodeRotation: [0.1, 0, 0.05], settleOrder: 0 },

  { id: "corner-post-fl", label: "Corner trim post", geometry: { kind: "box", args: [0.07, 2.24, 0.07] }, color: metal, metalness: 0.6, roughness: 0.3, restPosition: [-1.25, 1.5, 1.28], explodeOffset: [-2.2, -0.6, 2.4], explodeRotation: [0.4, 0, 0], settleOrder: 0.02 },
  { id: "corner-post-fr", label: "Corner trim post", geometry: { kind: "box", args: [0.07, 2.24, 0.07] }, color: metal, metalness: 0.6, roughness: 0.3, restPosition: [1.25, 1.5, 1.28], explodeOffset: [2.2, -0.6, 2.4], explodeRotation: [-0.4, 0, 0], settleOrder: 0.02 },
  { id: "corner-post-bl", label: "Corner trim post", geometry: { kind: "box", args: [0.07, 2.24, 0.07] }, color: metal, metalness: 0.6, roughness: 0.3, restPosition: [-1.25, 1.5, -1.28], explodeOffset: [-2.2, -0.6, -2.4], explodeRotation: [0.4, 0, 0], settleOrder: 0.02 },
  { id: "corner-post-br", label: "Corner trim post", geometry: { kind: "box", args: [0.07, 2.24, 0.07] }, color: metal, metalness: 0.6, roughness: 0.3, restPosition: [1.25, 1.5, -1.28], explodeOffset: [2.2, -0.6, -2.4], explodeRotation: [-0.4, 0, 0], settleOrder: 0.02 },

  { id: "left-panel", label: "Side panel", geometry: { kind: "box", args: [0.06, 2.2, 2.3] }, color: white, metalness: 0.1, roughness: 0.4, restPosition: [-1.22, 1.5, 0], explodeOffset: [-2.6, 0.4, -0.6], explodeRotation: [0.2, 0.6, 0], settleOrder: 0.05 },
  { id: "right-panel", label: "Side panel", geometry: { kind: "box", args: [0.06, 2.2, 2.3] }, color: white, metalness: 0.1, roughness: 0.4, restPosition: [1.22, 1.5, 0], explodeOffset: [2.6, 0.4, -0.6], explodeRotation: [-0.2, -0.6, 0], settleOrder: 0.05 },
  { id: "back-panel", label: "Back panel", geometry: { kind: "box", args: [2.4, 2.2, 0.06] }, color: white, metalness: 0.1, roughness: 0.4, restPosition: [0, 1.5, -1.22], explodeOffset: [0.5, 0.9, -2.6], explodeRotation: [0.4, 0.1, 0], settleOrder: 0.08 },

  { id: "vent-left-1", label: "Vent slat", geometry: { kind: "box", args: [0.015, 0.04, 1.3] }, color: metalDark, roughness: 0.6, restPosition: [-1.24, 1.95, 0], explodeOffset: [-2.4, 1.7, -1.2], explodeRotation: [0, 0.3, 0], settleOrder: 0.11 },
  { id: "vent-left-2", label: "Vent slat", geometry: { kind: "box", args: [0.015, 0.04, 1.3] }, color: metalDark, roughness: 0.6, restPosition: [-1.24, 1.55, 0], explodeOffset: [-2.4, 1.3, -1.2], explodeRotation: [0, 0.3, 0], settleOrder: 0.11 },
  { id: "vent-right-1", label: "Vent slat", geometry: { kind: "box", args: [0.015, 0.04, 1.3] }, color: metalDark, roughness: 0.6, restPosition: [1.24, 1.95, 0], explodeOffset: [2.4, 1.7, -1.2], explodeRotation: [0, -0.3, 0], settleOrder: 0.11 },
  { id: "vent-right-2", label: "Vent slat", geometry: { kind: "box", args: [0.015, 0.04, 1.3] }, color: metalDark, roughness: 0.6, restPosition: [1.24, 1.55, 0], explodeOffset: [2.4, 1.3, -1.2], explodeRotation: [0, -0.3, 0], settleOrder: 0.11 },

  { id: "led-bar", label: "Interior LED bar", geometry: { kind: "box", args: [2.2, 0.025, 0.06] }, color: ledWhite, emissive: ledWhite, emissiveIntensity: 0.35, restPosition: [0, 2.56, -0.85], explodeOffset: [0, 2.2, -2.3], explodeRotation: [0.2, 0, 0], settleOrder: 0.095 },
  { id: "top-panel", label: "Roof panel", geometry: { kind: "box", args: [2.44, 0.06, 2.34] }, color: white, metalness: 0.1, roughness: 0.4, restPosition: [0, 2.63, 0], explodeOffset: [0, 2.3, 0.4], explodeRotation: [0.25, 0.15, 0], settleOrder: 0.1 },

  { id: "logo-plate", label: "Lit logo plate", geometry: { kind: "box", args: [0.5, 0.09, 0.015] }, color: blueAccent, emissive: blueAccent, emissiveIntensity: 0.5, restPosition: [0, 0.22, 1.31], explodeOffset: [0, -1.8, 2.6], explodeRotation: [0.3, 0, 0], settleOrder: 0.12 },

  { id: "front-door", label: "Glass door", geometry: { kind: "box", args: [2.3, 2.1, 0.035] }, color: glassTint, metalness: 0.1, roughness: 0.1, finalOpacity: 0.28, restPosition: [0, 1.5, 1.2], explodeOffset: [-0.6, -0.8, 2.6], explodeRotation: [-0.3, 0.5, 0], settleOrder: 0.13 },
  { id: "door-hinge-top", label: "Door hinge", geometry: { kind: "cylinder", args: [0.035, 0.035, 0.16, 12] }, color: metalDark, metalness: 0.7, roughness: 0.3, restPosition: [-1.15, 2.05, 1.2], explodeOffset: [-2.0, 1.7, 2.4], explodeRotation: [0.5, 0, 0], settleOrder: 0.135 },
  { id: "door-hinge-bottom", label: "Door hinge", geometry: { kind: "cylinder", args: [0.035, 0.035, 0.16, 12] }, color: metalDark, metalness: 0.7, roughness: 0.3, restPosition: [-1.15, 0.95, 1.2], explodeOffset: [-2.0, 0.6, 2.4], explodeRotation: [-0.5, 0, 0], settleOrder: 0.135 },
  { id: "door-handle", label: "Door handle", geometry: { kind: "box", args: [0.035, 0.45, 0.035] }, color: metal, metalness: 0.7, roughness: 0.25, restPosition: [1.02, 1.5, 1.23], explodeOffset: [2.2, 1.0, 2.6], explodeRotation: [0, 0, 0.6], settleOrder: 0.14 },

  // ---- Internal gantry (visible through the door) ----
  { id: "bed-frame", label: "Heated bed", geometry: { kind: "box", args: [1.9, 0.08, 1.9] }, color: metalDark, metalness: 0.3, roughness: 0.6, restPosition: [0, 0.55, 0], explodeOffset: [0, -1.4, 0.6], explodeRotation: [0, 0, 0], settleOrder: 0.16 },
  { id: "bed-knob-fl", label: "Bed leveling knob", geometry: { kind: "cylinder", args: [0.045, 0.045, 0.07, 12] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [-0.85, 0.48, 0.85], explodeOffset: [-1.6, -1.2, 1.6], explodeRotation: [0.4, 0, 0], settleOrder: 0.18 },
  { id: "bed-knob-fr", label: "Bed leveling knob", geometry: { kind: "cylinder", args: [0.045, 0.045, 0.07, 12] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [0.85, 0.48, 0.85], explodeOffset: [1.6, -1.2, 1.6], explodeRotation: [-0.4, 0, 0], settleOrder: 0.18 },
  { id: "bed-knob-bl", label: "Bed leveling knob", geometry: { kind: "cylinder", args: [0.045, 0.045, 0.07, 12] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [-0.85, 0.48, -0.85], explodeOffset: [-1.6, -1.2, -1.6], explodeRotation: [0.4, 0, 0], settleOrder: 0.18 },
  { id: "bed-knob-br", label: "Bed leveling knob", geometry: { kind: "cylinder", args: [0.045, 0.045, 0.07, 12] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [0.85, 0.48, -0.85], explodeOffset: [1.6, -1.2, -1.6], explodeRotation: [-0.4, 0, 0], settleOrder: 0.18 },
  { id: "build-plate", label: "Build plate", geometry: { kind: "box", args: [1.85, 0.03, 1.85] }, color: cream, roughness: 0.6, restPosition: [0, 0.6, 0], explodeOffset: [0, -1.1, 1.0], explodeRotation: [0, 0, 0], settleOrder: 0.2 },

  { id: "z-rail-left", label: "Z rail", geometry: { kind: "cylinder", args: [0.045, 0.045, 2.1, 16] }, color: metal, metalness: 0.8, roughness: 0.25, restPosition: [-0.95, 1.45, 0.05], explodeOffset: [-1.9, -0.6, -1.4], explodeRotation: [0.3, 0, 0], settleOrder: 0.22 },
  { id: "z-rail-right", label: "Z rail", geometry: { kind: "cylinder", args: [0.045, 0.045, 2.1, 16] }, color: metal, metalness: 0.8, roughness: 0.25, restPosition: [0.95, 1.45, 0.05], explodeOffset: [1.9, -0.6, -1.4], explodeRotation: [-0.3, 0, 0], settleOrder: 0.22 },
  { id: "z-leadscrew-left", label: "Z leadscrew", geometry: { kind: "cylinder", args: [0.018, 0.018, 2.0, 12] }, color: brass, metalness: 0.7, roughness: 0.3, restPosition: [-0.8, 1.45, 0.05], explodeOffset: [-1.6, -0.9, -1.6], explodeRotation: [0.3, 0, 0], settleOrder: 0.23 },
  { id: "z-leadscrew-right", label: "Z leadscrew", geometry: { kind: "cylinder", args: [0.018, 0.018, 2.0, 12] }, color: brass, metalness: 0.7, roughness: 0.3, restPosition: [0.8, 1.45, 0.05], explodeOffset: [1.6, -0.9, -1.6], explodeRotation: [-0.3, 0, 0], settleOrder: 0.23 },
  { id: "z-motor-left", label: "Z motor", geometry: { kind: "box", args: [0.15, 0.15, 0.15] }, color: metalDark, metalness: 0.4, roughness: 0.5, restPosition: [-0.8, 0.32, 0.05], explodeOffset: [-1.7, -1.7, -1.2], explodeRotation: [0.3, 0.2, 0], settleOrder: 0.25 },
  { id: "z-motor-right", label: "Z motor", geometry: { kind: "box", args: [0.15, 0.15, 0.15] }, color: metalDark, metalness: 0.4, roughness: 0.5, restPosition: [0.8, 0.32, 0.05], explodeOffset: [1.7, -1.7, -1.2], explodeRotation: [-0.3, -0.2, 0], settleOrder: 0.25 },

  { id: "x-gantry-beam", label: "X gantry beam", geometry: { kind: "box", args: [2.0, 0.14, 0.14] }, color: blueAccent, metalness: 0.4, roughness: 0.4, restPosition: [0, 2.05, 0.1], explodeOffset: [0, 1.6, 2.0], explodeRotation: [0, 0, 0.3], ridesGantry: true, settleOrder: 0.32 },
  { id: "cable-chain-1", label: "Cable chain link", geometry: { kind: "box", args: [0.05, 0.05, 0.05] }, color: metalDark, roughness: 0.6, restPosition: [-0.25, 1.9, 0.15], explodeOffset: [-1.2, 1.4, 1.8], explodeRotation: [0.4, 0.4, 0], ridesGantry: true, settleOrder: 0.36 },
  { id: "cable-chain-2", label: "Cable chain link", geometry: { kind: "box", args: [0.05, 0.05, 0.05] }, color: metalDark, roughness: 0.6, restPosition: [-0.5, 1.8, 0.15], explodeOffset: [-1.4, 1.3, 1.9], explodeRotation: [0.4, 0.4, 0], ridesGantry: true, settleOrder: 0.36 },
  { id: "cable-chain-3", label: "Cable chain link", geometry: { kind: "box", args: [0.05, 0.05, 0.05] }, color: metalDark, roughness: 0.6, restPosition: [-0.75, 1.65, 0.15], explodeOffset: [-1.6, 1.1, 2.0], explodeRotation: [0.4, 0.4, 0], ridesGantry: true, settleOrder: 0.36 },
  { id: "toolhead", label: "Toolhead carriage", geometry: { kind: "box", args: [0.3, 0.26, 0.3] }, color: metalDark, metalness: 0.5, roughness: 0.4, restPosition: [0, 1.95, 0.15], explodeOffset: [0.5, 1.3, 2.3], explodeRotation: [0.5, 0.3, 0], ridesGantry: true, settleOrder: 0.42 },
  { id: "toolhead-fan", label: "Cooling fan duct", geometry: { kind: "cylinder", args: [0.055, 0.055, 0.05, 16] }, color: white, roughness: 0.4, restRotation: [Math.PI / 2, 0, 0], restPosition: [0.14, 1.95, 0.32], explodeOffset: [1.0, 1.5, 2.5], explodeRotation: [0.3, 0.5, 0], ridesGantry: true, settleOrder: 0.44 },
  { id: "heatsink", label: "Heatsink block", geometry: { kind: "box", args: [0.16, 0.1, 0.16] }, color: metal, metalness: 0.6, roughness: 0.3, restPosition: [0, 2.14, 0.15], explodeOffset: [-0.4, 1.6, 2.4], explodeRotation: [0.4, 0.3, 0], ridesGantry: true, settleOrder: 0.46 },
  { id: "nozzle", label: "Hotend nozzle", geometry: { kind: "cone", args: [0.05, 0.14, 20] }, color: brass, metalness: 0.8, roughness: 0.25, restPosition: [0, 1.77, 0.15], restRotation: [Math.PI, 0, 0], explodeOffset: [0.3, 1.0, 2.5], explodeRotation: [0.7, 0.4, 0], ridesGantry: true, settleOrder: 0.5 },

  // ---- External details ----
  { id: "screen", label: "Status screen", geometry: { kind: "box", args: [0.34, 0.22, 0.02] }, color: black, emissive: screenGlow, emissiveIntensity: 0.6, restPosition: [0.85, 0.55, 1.22], explodeOffset: [1.8, -0.3, 2.4], explodeRotation: [0, 0.6, 0], settleOrder: 0.55 },
  { id: "screen-bezel", label: "Screen bezel", geometry: { kind: "box", args: [0.4, 0.28, 0.015] }, color: black, roughness: 0.5, restPosition: [0.85, 0.55, 1.205], explodeOffset: [1.9, -0.4, 2.3], explodeRotation: [0, 0.6, 0], settleOrder: 0.56 },
  { id: "control-knob", label: "Jog wheel", geometry: { kind: "cylinder", args: [0.035, 0.035, 0.025, 16] }, color: metal, metalness: 0.6, roughness: 0.3, restRotation: [Math.PI / 2, 0, 0], restPosition: [1.15, 0.55, 1.22], explodeOffset: [2.1, -0.2, 2.5], explodeRotation: [0, 0.4, 0.4], settleOrder: 0.57 },

  { id: "spool-post", label: "Spool mount post", geometry: { kind: "cylinder", args: [0.035, 0.035, 0.28, 12] }, color: metalDark, metalness: 0.6, roughness: 0.35, restPosition: [-0.6, 2.8, -0.05], explodeOffset: [-1.3, 2.2, -1.7], explodeRotation: [0.3, 0.3, 0], settleOrder: 0.59 },
  { id: "spool-arm", label: "Spool holder arm", geometry: { kind: "cylinder", args: [0.03, 0.03, 0.35, 12] }, color: metalDark, metalness: 0.7, roughness: 0.3, restRotation: [Math.PI / 2, 0, 0], restPosition: [-0.6, 2.94, 0.12], explodeOffset: [-1.4, 2.3, -1.6], explodeRotation: [0.3, 0.3, 0], settleOrder: 0.6 },
  { id: "filament-sensor", label: "Filament sensor", geometry: { kind: "box", args: [0.09, 0.07, 0.09] }, color: metalDark, roughness: 0.5, emissive: "#4ade80", emissiveIntensity: 0.4, restPosition: [-0.3, 2.7, 0.3], explodeOffset: [-1.1, 2.2, 1.9], explodeRotation: [0.3, 0.3, 0], settleOrder: 0.62 },
  { id: "spool", label: "Filament spool", geometry: { kind: "cylinder", args: [0.32, 0.32, 0.16, 32] }, color: blueAccent, metalness: 0.15, roughness: 0.6, restRotation: [Math.PI / 2, 0, 0], restPosition: [-0.6, 2.94, 0.2], explodeOffset: [-1.2, 2.6, -2.0], explodeRotation: [0.4, 0.2, 0], settleOrder: 0.65 },

  { id: "foot-fl", label: "Foot", geometry: { kind: "cylinder", args: [0.08, 0.08, 0.05, 16] }, color: black, restPosition: [-1.15, 0.02, 1.15], explodeOffset: [-2.0, -1.9, 2.2], explodeRotation: [1, 0, 1], settleOrder: 0.7 },
  { id: "foot-fr", label: "Foot", geometry: { kind: "cylinder", args: [0.08, 0.08, 0.05, 16] }, color: black, restPosition: [1.15, 0.02, 1.15], explodeOffset: [2.0, -1.9, 2.2], explodeRotation: [-1, 0, -1], settleOrder: 0.7 },
  { id: "foot-bl", label: "Foot", geometry: { kind: "cylinder", args: [0.08, 0.08, 0.05, 16] }, color: black, restPosition: [-1.15, 0.02, -1.15], explodeOffset: [-2.0, -1.9, -2.2], explodeRotation: [1, 1, 0], settleOrder: 0.72 },
  { id: "foot-br", label: "Foot", geometry: { kind: "cylinder", args: [0.08, 0.08, 0.05, 16] }, color: black, restPosition: [1.15, 0.02, -1.15], explodeOffset: [2.0, -1.9, -2.2], explodeRotation: [-1, -1, 0], settleOrder: 0.72 },
  { id: "leveling-nut-fl", label: "Leveling nut", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.02, 16] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [-1.15, 0.06, 1.15], explodeOffset: [-2.1, -1.6, 2.3], explodeRotation: [1, 0, 1], settleOrder: 0.71 },
  { id: "leveling-nut-fr", label: "Leveling nut", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.02, 16] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [1.15, 0.06, 1.15], explodeOffset: [2.1, -1.6, 2.3], explodeRotation: [-1, 0, -1], settleOrder: 0.71 },
  { id: "leveling-nut-bl", label: "Leveling nut", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.02, 16] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [-1.15, 0.06, -1.15], explodeOffset: [-2.1, -1.6, -2.3], explodeRotation: [1, 1, 0], settleOrder: 0.71 },
  { id: "leveling-nut-br", label: "Leveling nut", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.02, 16] }, color: brass, metalness: 0.6, roughness: 0.35, restPosition: [1.15, 0.06, -1.15], explodeOffset: [2.1, -1.6, -2.3], explodeRotation: [-1, -1, 0], settleOrder: 0.71 },
];
