// 3D-print price estimation — all pure functions, no DOM/network access, so
// the same code runs client-side (instant, free, no server round-trip for
// the geometry math — see the README's own reasoning for why this beats
// running a real slicing engine for a "quick estimate" use case) and
// server-side if ever needed (e.g. validating a submitted quote).

export interface PrintMaterial {
  name: string;
  /** g/cm³ — a real physical property, safe to ship as a default. */
  densityGCm3: number;
  /** PKR per kg — business pricing, must be set for real by an admin. */
  pricePerKgPkr: number;
}

export interface PriceBreakdown {
  materialGrams: number;
  materialCost: number;
  serviceFee: number;
  total: number;
}

export function estimatePrice({
  grams,
  quantity,
  material,
  supportOverheadPercent,
  serviceFeePkr,
}: {
  grams: number;
  quantity: number;
  material: PrintMaterial;
  supportOverheadPercent: number;
  serviceFeePkr: number;
}): PriceBreakdown {
  const materialGrams = grams * Math.max(1, quantity) * (1 + supportOverheadPercent / 100);
  const materialCost = (materialGrams / 1000) * material.pricePerKgPkr;
  const serviceFee = serviceFeePkr;
  return {
    materialGrams: Math.round(materialGrams),
    materialCost: Math.round(materialCost),
    serviceFee,
    total: Math.round(materialCost + serviceFee),
  };
}

export function gramsFromVolume(volumeCm3: number, material: PrintMaterial): number {
  return volumeCm3 * material.densityGCm3;
}

export function gramsFromDimensions(widthMm: number, depthMm: number, heightMm: number, material: PrintMaterial): number {
  // A bounding-box volume massively overestimates a real (mostly hollow,
  // partially-infilled) print — scaled down by a flat "typical part fills
  // about a third of its bounding box" assumption. Rough on purpose: this
  // path is for someone with no file at all, not a substitute for an
  // actual model.
  const boundingBoxCm3 = (widthMm * depthMm * heightMm) / 1000;
  const ASSUMED_FILL_FRACTION = 0.35;
  return gramsFromVolume(boundingBoxCm3 * ASSUMED_FILL_FRACTION, material);
}

// ---------------------------------------------------------------- STL

function isLikelyBinaryStl(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  const expectedSize = 84 + triangleCount * 50;
  return expectedSize === buffer.byteLength;
}

function volumeFromTriangles(getTriangle: (i: number) => [number[], number[], number[]], count: number): number {
  let volume = 0;
  for (let i = 0; i < count; i++) {
    const [a, b, c] = getTriangle(i);
    // Signed volume of the tetrahedron formed by the triangle and the
    // origin (divergence theorem) — summed over a closed, consistently-
    // wound mesh, this equals the mesh's total volume.
    volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) -
        a[1] * (b[0] * c[2] - b[2] * c[0]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6;
  }
  return Math.abs(volume);
}

function parseBinaryStlVolumeMm3(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  return volumeFromTriangles((i) => {
    const offset = 84 + i * 50 + 12; // skip the per-triangle normal vector
    const readVertex = (o: number): number[] => [
      view.getFloat32(o, true),
      view.getFloat32(o + 4, true),
      view.getFloat32(o + 8, true),
    ];
    return [readVertex(offset), readVertex(offset + 12), readVertex(offset + 24)];
  }, triangleCount);
}

function parseAsciiStlVolumeMm3(text: string): number {
  const coords = Array.from(text.matchAll(/vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g)).map((m) => [
    parseFloat(m[1]),
    parseFloat(m[2]),
    parseFloat(m[3]),
  ]);
  const triangleCount = Math.floor(coords.length / 3);
  return volumeFromTriangles((i) => [coords[i * 3], coords[i * 3 + 1], coords[i * 3 + 2]], triangleCount);
}

/** Returns the mesh's volume in cm³ (STL files are conventionally authored in mm). */
export function parseStlVolumeCm3(buffer: ArrayBuffer): number {
  const volumeMm3 = isLikelyBinaryStl(buffer)
    ? parseBinaryStlVolumeMm3(buffer)
    : parseAsciiStlVolumeMm3(new TextDecoder().decode(buffer));
  return volumeMm3 / 1000;
}

// ---------------------------------------------------------------- OBJ

/** Returns the mesh's volume in cm³ (OBJ files are conventionally authored in mm for 3D printing). */
export function parseObjVolumeCm3(text: string): number {
  const vertices: number[][] = [];
  const triangles: [number[], number[], number[]][] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("v ")) {
      const parts = trimmed.split(/\s+/).slice(1).map(Number);
      vertices.push(parts);
    } else if (trimmed.startsWith("f ")) {
      // Each face token may be "v", "v/vt", "v/vt/vn", or "v//vn" — only
      // the leading vertex index matters here. Negative indices are
      // relative to the current end of the vertex list.
      const indices = trimmed
        .split(/\s+/)
        .slice(1)
        .map((token) => {
          const vIndex = parseInt(token.split("/")[0], 10);
          return vIndex > 0 ? vIndex - 1 : vertices.length + vIndex;
        });
      // Fan-triangulate faces with more than 3 vertices.
      for (let i = 1; i < indices.length - 1; i++) {
        triangles.push([vertices[indices[0]], vertices[indices[i]], vertices[indices[i + 1]]]);
      }
    }
  }

  const volumeMm3 = volumeFromTriangles((i) => triangles[i], triangles.length);
  return volumeMm3 / 1000;
}

// ---------------------------------------------------------------- G-code

const DEFAULT_FILAMENT_DIAMETER_MM = 1.75;

/**
 * Reads the filament usage a slicer already calculated and wrote into the
 * G-code's own comments — the most accurate estimate available short of
 * running a slicer ourselves, since the customer's slicer already did the
 * real work (accounting for their actual supports, infill and orientation).
 * Returns null if no recognized pattern is found, so the caller can fall
 * back to another input method instead of guessing.
 */
export function parseGcodeFilamentGrams(text: string, material: PrintMaterial): number | null {
  // PrusaSlicer / SuperSlicer: "; filament used [g] = 12.34" (sometimes
  // "total filament used [g]", sometimes multiple comma-separated values
  // for multi-extruder prints — sum them).
  const gramsMatch = [...text.matchAll(/filament used \[g\]\s*=\s*([\d.,\s]+)/gi)];
  if (gramsMatch.length > 0) {
    const total = gramsMatch[0][1]
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !Number.isNaN(v))
      .reduce((sum, v) => sum + v, 0);
    if (total > 0) return total;
  }

  // Cura (newer versions): ";Filament weight = 12.3g" style annotation.
  const curaWeightMatch = text.match(/filament weight\s*=?\s*([\d.]+)\s*g/i);
  if (curaWeightMatch) return parseFloat(curaWeightMatch[1]);

  // Cura (common case): ";Filament used: 3.2m" — a length, not a weight.
  // Convert via the filament's cross-section area and the selected
  // material's density, using the standard 1.75mm diameter unless the
  // file itself states otherwise.
  const lengthMatch = text.match(/filament used\s*[:=]\s*([\d.]+)\s*m\b/i);
  if (lengthMatch) {
    const diameterMatch = text.match(/filament diameter\s*=\s*([\d.]+)/i);
    const diameterMm = diameterMatch ? parseFloat(diameterMatch[1]) : DEFAULT_FILAMENT_DIAMETER_MM;
    const lengthMm = parseFloat(lengthMatch[1]) * 1000;
    const areaMm2 = Math.PI * (diameterMm / 2) ** 2;
    const volumeCm3 = (lengthMm * areaMm2) / 1000;
    return gramsFromVolume(volumeCm3, material);
  }

  return null;
}

// ---------------------------------------------------------------- File handling

export type ModelFileKind = "stl" | "obj" | "gcode" | "unsupported";

export function detectModelFileKind(filename: string): ModelFileKind {
  const name = filename.toLowerCase();
  if (name.endsWith(".stl")) return "stl";
  if (name.endsWith(".obj")) return "obj";
  if (name.endsWith(".gcode") || name.endsWith(".gco") || name.endsWith(".g")) return "gcode";
  return "unsupported";
}

/** Parses an STL or OBJ File into its volume (cm³) — shared by the homepage quick-quote widget and the full calculator page. */
export async function parseModelFileVolumeCm3(file: File): Promise<number> {
  const kind = detectModelFileKind(file.name);
  if (kind === "stl") return parseStlVolumeCm3(await file.arrayBuffer());
  if (kind === "obj") return parseObjVolumeCm3(await file.text());
  throw new Error("Expected an STL or OBJ file.");
}
