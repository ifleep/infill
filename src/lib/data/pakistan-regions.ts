import type { PakistanRegion } from "@/lib/types";

// Abstract, stylized hotspot layout evoking Pakistan's relative geography
// (north at top, Balochistan/Sindh forming the southern base) — an elegant
// interaction concept, not a survey-accurate boundary map.
export const pakistanRegions: PakistanRegion[] = [
  {
    id: "gb",
    name: "Gilgit-Baltistan",
    shortLabel: "GB",
    motif: "Angular peak lattice — echoing the high mountain ranges of the north.",
    copy: "Home to some of the world's highest peaks, and the northern edge of INFiLLPK's reach.",
    shape: { cx: 150, rx: 46, cy: 46, ry: 34 },
    labelPoint: { x: 150, y: 46 },
  },
  {
    id: "kp",
    name: "Khyber Pakhtunkhwa",
    shortLabel: "KP",
    motif: "Interlocking geometric border pattern drawn from Pashtun textile motifs.",
    copy: "A growing base of makers and technical institutes across the province.",
    shape: { cx: 104, cy: 118, rx: 42, ry: 40 },
    labelPoint: { x: 104, y: 118 },
  },
  {
    id: "ajk",
    name: "Azad Jammu & Kashmir",
    shortLabel: "AJK",
    motif: "Layered chevrons, referencing the terraced valleys of the region.",
    copy: "Reachable through the same nationwide shipping network as every other region.",
    shape: { cx: 202, cy: 120, rx: 34, ry: 32 },
    labelPoint: { x: 202, y: 120 },
  },
  {
    id: "isb",
    name: "Islamabad",
    shortLabel: "ISB",
    motif: "A single precise grid mark — the capital, and INFiLLPK's logistics hub.",
    copy: "Central hub for support, service and same-day dispatch across the twin cities.",
    shape: { cx: 158, cy: 150, rx: 14, ry: 12 },
    labelPoint: { x: 158, y: 150 },
  },
  {
    id: "punjab",
    name: "Punjab",
    shortLabel: "Punjab",
    motif: "Repeating diamond lattice, drawn from Punjabi phulkari geometry.",
    copy: "Pakistan's manufacturing heartland — and the largest concentration of INFiLLPK customers.",
    shape: { cx: 172, cy: 220, rx: 58, ry: 66 },
    labelPoint: { x: 172, y: 220 },
  },
  {
    id: "balochistan",
    name: "Balochistan",
    shortLabel: "Balochistan",
    motif: "Wide angular embroidery pattern inspired by Balochi needlework.",
    copy: "Pakistan's largest province by area — served the same as every other, no distance surcharge.",
    shape: { cx: 84, cy: 300, rx: 72, ry: 84 },
    labelPoint: { x: 84, y: 300 },
  },
  {
    id: "sindh",
    name: "Sindh",
    shortLabel: "Sindh",
    motif: "Ajrak block-print rhythm — one of Pakistan's most recognizable textile crafts.",
    copy: "From Karachi's industrial base to university labs across the province.",
    shape: { cx: 196, cy: 320, rx: 46, ry: 60 },
    labelPoint: { x: 196, y: 320 },
  },
];
