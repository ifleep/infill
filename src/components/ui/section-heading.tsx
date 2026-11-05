import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  inverted = false,
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  inverted?: boolean;
  className?: string;
  /** Pass "h1" when this is the one real page-level heading (e.g. a page
   * whose hero uses SectionHeading instead of its own separate <h1>).
   * Defaults to "h2" — most usages sit below a page's own real H1. */
  as?: "h1" | "h2";
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
      <Heading
        className={clsx(
          "font-display text-3xl font-semibold tracking-tight sm:text-4xl",
          inverted ? "text-on-navy" : "text-ink"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={clsx("mt-3 text-base", inverted ? "text-on-navy-muted" : "text-ink-muted")}>
          {description}
        </p>
      )}
    </div>
  );
}
