// Original line-art illustrations for the print/fabrication technology
// types shown on the homepage — detailed enough to stand alone as a large
// icon (not a tiny 24px glyph), drawn in the site's own stroke-based style
// rather than sourced from an icon pack or traced from a reference.
interface IconProps {
  size?: number;
  className?: string;
}

const base = {
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FdmIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M22 20 22 80" />
      <path d="M78 20 78 80" />
      <path d="M22 20 78 20" />
      <path d="M22 80 78 80" />
      <path d="M30 36 70 36" />
      <path d="M50 36 50 44" />
      <path d="M43 44 57 44 52 52 48 52z" fill="currentColor" stroke="none" />
      <path d="M32 76c4-10 10-4 14-10s10-8 14-2" />
      <circle cx="22" cy="82" r="3" />
      <circle cx="78" cy="82" r="3" />
    </svg>
  );
}

export function ResinIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M32 14 68 14 68 30 32 30z" />
      <path d="M46 30 46 46" />
      <path d="M54 30 54 46" />
      <path d="M28 46 72 46 66 62 34 62z" />
      <path d="M38 50 62 50M40 55 60 55" opacity="0.6" />
      <path d="M20 66 80 66 76 84 24 84z" />
      <circle cx="30" cy="75" r="3" />
      <circle cx="42" cy="75" r="3" />
    </svg>
  );
}

export function CoreXYIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <rect x="16" y="16" width="68" height="68" rx="4" />
      <circle cx="24" cy="24" r="4" />
      <circle cx="76" cy="24" r="4" />
      <circle cx="24" cy="76" r="4" />
      <circle cx="76" cy="76" r="4" />
      <path d="M28 28 72 72" />
      <path d="M72 28 28 72" />
      <rect x="42" y="42" width="16" height="16" rx="2" fill="currentColor" stroke="none" />
      <path d="M50 84 50 92M42 92 58 92" />
    </svg>
  );
}

export function LargeFormatIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M14 30 14 14 30 14" />
      <path d="M70 14 86 14 86 30" />
      <path d="M86 70 86 86 70 86" />
      <path d="M30 86 14 86 14 70" />
      <rect x="32" y="32" width="36" height="36" rx="2" opacity="0.55" />
      <path d="M40 50 60 50M50 40 50 60" opacity="0.55" />
    </svg>
  );
}

export function IndustrialIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M50 20a20 20 0 0 1 17.3 10l7-1 2 7-6 4a20 20 0 0 1 0 10l6 4-2 7-7-1a20 20 0 0 1-17.3 10 20 20 0 0 1-17.3-10l-7 1-2-7 6-4a20 20 0 0 1 0-10l-6-4 2-7 7 1A20 20 0 0 1 50 20z" />
      <circle cx="50" cy="50" r="9" />
    </svg>
  );
}

export function EducationalIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 38 50 20 88 38 50 56z" />
      <path d="M28 46 28 66c0 6 10 11 22 11s22-5 22-11V46" />
      <path d="M88 38 88 62" />
      <circle cx="88" cy="66" r="3" />
      <path d="M50 56 50 76" opacity="0.5" />
    </svg>
  );
}

export function CncIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="50" cy="16" r="5" />
      <path d="M50 21 50 46" />
      <path d="M42 46 58 46 54 58 46 58z" />
      <path d="M50 58 50 66" />
      <path d="M18 66 82 82 18 82z" opacity="0.5" />
      <path d="M18 66 82 66 82 82 18 82z" />
      <path d="M30 66 30 82M46 66 46 82M62 66 62 82" opacity="0.4" />
    </svg>
  );
}

export function LaserIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M18 42 82 42" />
      <path d="M18 42 18 34M82 42 82 34" />
      <rect x="40" y="42" width="20" height="12" rx="2" />
      <path d="M50 54 50 66" />
      <path d="M42 68 58 68 50 78z" fill="currentColor" stroke="none" />
      <rect x="14" y="68" width="72" height="16" rx="2" />
      <path d="M26 76 34 76M66 76 74 76" opacity="0.6" />
    </svg>
  );
}

export function RobotIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M50 8 50 16" />
      <circle cx="50" cy="6" r="2.5" fill="currentColor" stroke="none" />
      <rect x="32" y="16" width="36" height="26" rx="6" />
      <circle cx="42" cy="29" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="58" cy="29" r="3.5" fill="currentColor" stroke="none" />
      <path d="M32 28 24 28 24 40" />
      <path d="M68 28 76 28 76 40" />
      <rect x="28" y="42" width="44" height="30" rx="4" />
      <path d="M38 72 36 86M62 72 64 86" />
      <path d="M30 86 42 86M58 86 70 86" />
    </svg>
  );
}

export function UvPrintingIcon({ size = 96, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <rect x="18" y="16" width="64" height="20" rx="3" />
      <circle cx="30" cy="26" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="26" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="26" r="2.5" fill="currentColor" stroke="none" />
      <path d="M30 36 30 46M50 36 50 46M70 36 70 46" />
      <path d="M14 82 86 82" />
      <path d="M24 62 20 74M38 58 36 74M50 56 50 74M62 58 64 74M76 62 80 74" opacity="0.6" />
      <rect x="34" y="74" width="32" height="8" rx="1" opacity="0.55" />
    </svg>
  );
}
