import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline-invert";
type Size = "md" | "lg" | "sm";

const base =
  "focus-ring inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-600 active:bg-blue-900",
  secondary: "bg-ink text-paper hover:bg-ink/85",
  ghost: "bg-transparent text-ink hover:bg-surface-sunken",
  "outline-invert":
    "border border-on-navy-muted text-on-navy hover:border-on-navy hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded",
  md: "h-11 px-5 text-sm rounded-md",
  lg: "h-13 px-7 text-base rounded-md",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconTrailing?: ReactNode;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconTrailing,
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {icon}
      {children}
      {iconTrailing}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  iconTrailing,
  className,
  children,
  onClick,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {icon}
      {children}
      {iconTrailing}
    </Link>
  );
}
