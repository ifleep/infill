// Very subtle, self-designed geometric line patterns nodding to regional
// textile/craft traditions — abstracted shapes (diamonds, chevrons,
// lattices), not reproductions of any specific real-world ajrak/phulkari
// artwork, and not sourced from photographs. Rendered as a faint edge
// watermark on a few marketing pages (home, about, contact) per region —
// intentionally not literal or attributed to a single craft, just a hint
// of "made for every province."
export type RegionalMotif = "sindh" | "punjab" | "balochistan" | "kp";

const TILE_SIZE: Record<RegionalMotif, { w: number; h: number }> = {
  sindh: { w: 64, h: 64 },
  punjab: { w: 48, h: 48 },
  balochistan: { w: 56, h: 28 },
  kp: { w: 40, h: 40 },
};

function motifTile(motif: RegionalMotif) {
  switch (motif) {
    case "sindh":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="4" y="4" width="56" height="56" />
          <rect x="22" y="22" width="20" height="20" transform="rotate(45 32 32)" />
          <circle cx="32" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="32" cy="60" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="32" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="60" cy="32" r="1.5" fill="currentColor" stroke="none" />
        </g>
      );
    case "punjab":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M24 0 L48 24 L24 48 L0 24 Z" />
          <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
        </g>
      );
    case "balochistan":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M0 28 L14 0 L28 28 L42 0 L56 28" />
        </g>
      );
    case "kp":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" />
          <rect x="20" y="20" width="16" height="16" transform="rotate(45 28 28)" />
        </g>
      );
  }
}

export function RegionalMotifEdge({ motif, side }: { motif: RegionalMotif; side: "left" | "right" }) {
  const patternId = `motif-${motif}-${side}`;
  const { w, h } = TILE_SIZE[motif];
  const fadeDirection = side === "left" ? "to right" : "to left";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-y-0 z-[-1] hidden w-48 text-ink opacity-[0.06] lg:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        maskImage: `linear-gradient(${fadeDirection}, black, transparent)`,
        WebkitMaskImage: `linear-gradient(${fadeDirection}, black, transparent)`,
      }}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id={patternId} width={w} height={h} patternUnits="userSpaceOnUse">
            {motifTile(motif)}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
