import clsx from "clsx";

export function Wordmark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        "font-display select-none text-xl font-semibold tracking-tight",
        inverted ? "text-on-navy" : "text-ink",
        className
      )}
    >
      INFiLL<span className={inverted ? "text-blue-300" : "text-blue-700"}>PK</span>
    </span>
  );
}
