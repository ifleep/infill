import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  inverted = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("max-w-2xl", className)}>
      {eyebrow && (
        <p
          className={clsx(
            "mb-3 text-xs font-semibold uppercase tracking-wide",
            inverted ? "text-blue-300" : "text-blue-700"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          "font-display text-3xl font-semibold tracking-tight sm:text-4xl",
          inverted ? "text-on-navy" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={clsx("mt-3 text-base", inverted ? "text-on-navy-muted" : "text-ink-muted")}>
          {description}
        </p>
      )}
    </div>
  );
}
