// Small original line-icon set for the print/fabrication technology types
// listed on the homepage — drawn to match the existing Phosphor "regular"
// icon language already used across the site (24x24, ~1.5 stroke, rounded
// joins) rather than mixing in an unrelated icon pack or sourcing from
// online libraries with unclear licensing.
interface IconProps {
  size?: number;
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FdmIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 2.5v3.3" />
      <path d="M9.2 5.8h5.6l-1.7 3.4h-2.2z" />
      <line x1="6" y1="13.5" x2="18" y2="13.5" />
      <line x1="7" y1="16.7" x2="17" y2="16.7" />
      <line x1="8" y1="19.9" x2="16" y2="19.9" />
    </svg>
  );
}

export function ResinIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 2.8c2.1 2.9 3.6 5.1 3.6 7.1a3.6 3.6 0 1 1-7.2 0c0-2 1.5-4.2 3.6-7.1z" />
      <path d="M4.5 15.5h15l-1.6 5.2H6.1z" />
    </svg>
  );
}

export function CoreXYIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="1.6" />
      <circle cx="19" cy="5" r="1.6" />
      <circle cx="5" cy="19" r="1.6" />
      <circle cx="19" cy="19" r="1.6" />
      <path d="M6.3 5.9 17.7 18.1" />
      <path d="M17.7 5.9 6.3 18.1" />
      <rect x="10" y="10" width="4" height="4" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LargeFormatIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M4 9.5V4h5.5" />
      <path d="M14.5 4H20v5.5" />
      <path d="M20 14.5V20h-5.5" />
      <path d="M9.5 20H4v-5.5" />
    </svg>
  );
}

export function IndustrialIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.6v2.7M12 18.7v2.7M21.4 12h-2.7M5.3 12H2.6M18.3 5.7l-1.9 1.9M7.6 16.4l-1.9 1.9M18.3 18.3l-1.9-1.9M7.6 7.6 5.7 5.7" />
    </svg>
  );
}

export function EducationalIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 4 2.5 9l9.5 5 9.5-5z" />
      <path d="M6.3 11.4v5.1c0 1.5 2.6 2.7 5.7 2.7s5.7-1.2 5.7-2.7v-5.1" />
      <path d="M21.5 9v6.2" />
    </svg>
  );
}

export function CncIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="4" r="1.3" />
      <path d="M12 5.3v6" />
      <path d="M10.2 11.3 12 13.1l1.8-1.8M10.2 13.3 12 15.1l1.8-1.8" />
      <line x1="12" y1="15.1" x2="12" y2="18.5" />
      <line x1="5" y1="18.5" x2="19" y2="18.5" />
    </svg>
  );
}

export function LaserIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <circle cx="5.5" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M6.6 5.6 14 13" />
      <path d="M17 10.2 15.8 13M13 11.8l1.2 3.2M17.4 13.4 14 13" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

export function UvPrintingIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true">
      <rect x="5" y="4" width="14" height="4" rx="0.8" />
      <line x1="9" y1="8" x2="9" y2="11" />
      <line x1="15" y1="8" x2="15" y2="11" />
      <line x1="4" y1="19" x2="20" y2="19" />
      <path d="M8 15.3 9 12.8" />
      <path d="M12 15.3v-2.6" />
      <path d="M16 15.3 15 12.8" />
    </svg>
  );
}
