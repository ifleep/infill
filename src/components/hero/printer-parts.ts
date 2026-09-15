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
}

const metal = "#23262c";
const metalLight = "#3a3f48";
const blueAccent = "#2f62e0";
const brass = "#b8863b";
const pcbGreen = "#1d3b2a";
const cream = "#efe9df";
const gray = "#d7dade";
const black = "#111318";

export const printerParts: PrinterPart[] = [
  // ---- Frame ----
  { id: "post-fl", label: "Frame post", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [-1.05, 1.3, 1.05], explodeOffset: [-1.6, -0.6, 1.4], explodeRotation: [0.4, 0.2, 0.1], settleOrder: 0.05 },
  { id: "post-fr", label: "Frame post", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [1.05, 1.3, 1.05], explodeOffset: [1.6, -0.6, 1.4], explodeRotation: [-0.3, -0.2, 0.15], settleOrder: 0.05 },
  { id: "post-bl", label: "Frame post", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [-1.05, 1.3, -1.05], explodeOffset: [-1.5, 0.7, -1.5], explodeRotation: [0.2, 0.3, -0.1], settleOrder: 0.08 },
  { id: "post-br", label: "Frame post", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [1.05, 1.3, -1.05], explodeOffset: [1.5, 0.7, -1.5], explodeRotation: [-0.2, -0.3, 0.1], settleOrder: 0.08 },
  { id: "base", label: "Base enclosure", geometry: { kind: "box", args: [2.3, 0.3, 2.3] }, color: metalLight, metalness: 0.3, roughness: 0.6, restPosition: [0, 0.15, 0], explodeOffset: [0, -1.8, 0], explodeRotation: [0.15, 0, 0.08], settleOrder: 0 },
  { id: "top-beam", label: "Top frame beam", geometry: { kind: "box", args: [2.3, 0.12, 0.3] }, color: blueAccent, metalness: 0.4, roughness: 0.5, restPosition: [0, 2.55, 1.0], explodeOffset: [0, 1.9, 1.6], explodeRotation: [-0.3, 0, 0], settleOrder: 0.12 },

  // ---- Rails ----
  { id: "rail-x1", label: "X rail", geometry: { kind: "cylinder", args: [0.03, 0.03, 2.2, 20] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0, 2.2, 0.18], restRotation: [0, 0, Math.PI / 2], explodeOffset: [0, 1.4, 1.8], explodeRotation: [0, 0.6, Math.PI / 2], settleOrder: 0.2 },
  { id: "rail-x2", label: "X rail", geometry: { kind: "cylinder", args: [0.03, 0.03, 2.2, 20] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0, 2.2, -0.18], restRotation: [0, 0, Math.PI / 2], explodeOffset: [0, 1.4, -1.8], explodeRotation: [0, -0.6, Math.PI / 2], settleOrder: 0.2 },
  { id: "rail-z1", label: "Z rail", geometry: { kind: "cylinder", args: [0.035, 0.035, 2.4, 20] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0.95, 1.3, -0.9], explodeOffset: [1.9, -0.4, -1.2], explodeRotation: [0.3, 0, 0], settleOrder: 0.18 },
  { id: "rail-z2", label: "Z rail", geometry: { kind: "cylinder", args: [0.035, 0.035, 2.4, 20] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [-0.95, 1.3, -0.9], explodeOffset: [-1.9, -0.4, -1.2], explodeRotation: [-0.3, 0, 0], settleOrder: 0.18 },

  // ---- Motors ----
  { id: "motor-a", label: "Stepper motor", geometry: { kind: "box", args: [0.22, 0.22, 0.28] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.95, 2.5, -0.95], explodeOffset: [1.7, 1.2, -2.0], explodeRotation: [0.4, 0.5, 0], settleOrder: 0.3 },
  { id: "motor-b", label: "Stepper motor", geometry: { kind: "box", args: [0.22, 0.22, 0.28] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [-0.95, 2.5, -0.95], explodeOffset: [-1.7, 1.2, -2.0], explodeRotation: [-0.4, -0.5, 0], settleOrder: 0.3 },
  { id: "motor-z", label: "Z motor", geometry: { kind: "cylinder", args: [0.14, 0.14, 0.24, 24] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.95, 0.2, -0.95], explodeOffset: [1.6, -1.0, -1.6], explodeRotation: [0, 0.5, 0.3], settleOrder: 0.28 },
  { id: "motor-e", label: "Extruder motor", geometry: { kind: "cylinder", args: [0.11, 0.11, 0.18, 24] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.2, 2.05, 0.32], explodeOffset: [1.3, 0.9, 1.5], explodeRotation: [0.5, 0, 0.2], ridesGantry: true, settleOrder: 0.42 },

  // ---- Belts ----
  { id: "belt-1", label: "Drive belt", geometry: { kind: "box", args: [2.0, 0.02, 0.02] }, color: black, roughness: 0.9, restPosition: [0, 2.15, 0.15], explodeOffset: [0, -1.6, 1.3], explodeRotation: [0, 0, 0.1], settleOrder: 0.35 },
  { id: "belt-2", label: "Drive belt", geometry: { kind: "box", args: [2.0, 0.02, 0.02] }, color: black, roughness: 0.9, restPosition: [0, 2.15, -0.15], explodeOffset: [0, -1.6, -1.3], explodeRotation: [0, 0, -0.1], settleOrder: 0.35 },

  // ---- Toolhead: extruder + hotend + fans ----
  { id: "extruder", label: "Toolhead carriage", geometry: { kind: "box", args: [0.3, 0.25, 0.3] }, color: metalLight, metalness: 0.5, roughness: 0.4, restPosition: [0, 2.0, 0], explodeOffset: [0.4, 1.6, 2.2], explodeRotation: [0.6, 0.3, 0], ridesGantry: true, settleOrder: 0.45 },
  { id: "heatsink", label: "Heat sink", geometry: { kind: "cylinder", args: [0.06, 0.06, 0.22, 20] }, color: gray, metalness: 0.7, roughness: 0.3, restPosition: [0, 1.82, 0], explodeOffset: [-0.3, 1.3, 2.4], explodeRotation: [0.3, 0.2, 0], ridesGantry: true, settleOrder: 0.5 },
  { id: "nozzle", label: "Hotend nozzle", geometry: { kind: "cone", args: [0.045, 0.12, 24] }, color: brass, metalness: 0.8, roughness: 0.25, restPosition: [0, 1.66, 0], restRotation: [Math.PI, 0, 0], explodeOffset: [0.2, 0.9, 2.6], explodeRotation: [0.8, 0.4, 0], ridesGantry: true, settleOrder: 0.55 },
  { id: "fan-1", label: "Part-cooling fan", geometry: { kind: "cylinder", args: [0.09, 0.09, 0.04, 24] }, color: gray, roughness: 0.5, restPosition: [0.16, 1.95, 0.14], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [1.1, 1.5, 1.9], explodeRotation: [0, 0.9, 0], ridesGantry: true, settleOrder: 0.48 },
  { id: "fan-2", label: "Hotend fan", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.04, 24] }, color: gray, roughness: 0.5, restPosition: [-0.16, 2.05, 0.05], restRotation: [Math.PI / 2, 0.3, 0], explodeOffset: [-1.0, 1.7, 1.7], explodeRotation: [0, -0.9, 0], ridesGantry: true, settleOrder: 0.48 },

  // ---- Electronics ----
  { id: "mainboard", label: "Mainboard", geometry: { kind: "box", args: [0.9, 0.02, 0.5] }, color: pcbGreen, roughness: 0.7, restPosition: [0, 0.16, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0, -1.9, -2.0], explodeRotation: [0.5, 0, 0.2], settleOrder: 0.1 },
  { id: "chip-1", label: "Driver module", geometry: { kind: "box", args: [0.08, 0.02, 0.1] }, color: metal, restPosition: [0.25, 0.18, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0.5, -2.0, -2.2], explodeRotation: [0, 0.4, 0], settleOrder: 0.1 },
  { id: "chip-2", label: "Driver module", geometry: { kind: "box", args: [0.08, 0.02, 0.1] }, color: metal, restPosition: [-0.1, 0.18, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [-0.5, -2.0, -2.2], explodeRotation: [0, -0.4, 0], settleOrder: 0.1 },

  // ---- Build plate ----
  { id: "bed-frame", label: "Heated bed", geometry: { kind: "box", args: [1.95, 0.06, 1.95] }, color: metalLight, metalness: 0.3, roughness: 0.6, restPosition: [0, 0.32, 0], explodeOffset: [0, -1.2, 0.4], explodeRotation: [0, 0, 0], settleOrder: 0.15 },
  { id: "build-plate", label: "Build plate", geometry: { kind: "box", args: [1.9, 0.03, 1.9] }, color: cream, roughness: 0.6, restPosition: [0, 0.36, 0], explodeOffset: [0, -1.0, 0.9], explodeRotation: [0, 0, 0], settleOrder: 0.22 },

  // ---- Filament path ----
  { id: "spool", label: "Filament spool", geometry: { kind: "cylinder", args: [0.28, 0.28, 0.12, 32] }, color: blueAccent, metalness: 0.2, roughness: 0.6, restPosition: [0, 2.75, -1.0], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0, 2.2, -2.4], explodeRotation: [0.3, 0.2, 0], settleOrder: 0.6 },
  { id: "ptfe-tube", label: "Filament guide tube", geometry: { kind: "cylinder", args: [0.02, 0.02, 0.9, 16] }, color: "#2a2f38", restPosition: [0, 2.35, -0.5], restRotation: [1.1, 0, 0], explodeOffset: [0.6, 1.9, -2.0], explodeRotation: [0.5, 0.5, 0], settleOrder: 0.62 },

  // ---- Decorative fasteners ----
  { id: "screw-1", label: "Fastener", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [-1.05, 2.58, 1.05], explodeOffset: [-2.1, 2.3, 1.9], explodeRotation: [1, 1, 0], settleOrder: 0.7 },
  { id: "screw-2", label: "Fastener", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [1.05, 2.58, 1.05], explodeOffset: [2.1, 2.3, 1.9], explodeRotation: [-1, -1, 0], settleOrder: 0.7 },
  { id: "screw-3", label: "Fastener", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [-1.05, 0.02, 1.05], explodeOffset: [-2.0, -2.1, 2.0], explodeRotation: [1, 0, 1], settleOrder: 0.65 },
  { id: "screw-4", label: "Fastener", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [1.05, 0.02, 1.05], explodeOffset: [2.0, -2.1, 2.0], explodeRotation: [-1, 0, -1], settleOrder: 0.65 },
];

/** Gantry + toolhead group Y position, used for the phase-5 idle sweep along X. */
export const gantryRestY = 2.0;
