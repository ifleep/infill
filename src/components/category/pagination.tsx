import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";

export function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
}: {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      {currentPage > 1 ? (
        <Link
          href={hrefForPage(currentPage - 1)}
          className="focus-ring flex items-center gap-1 rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          <CaretLeft size={14} /> Previous
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className="flex cursor-not-allowed items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-ink-faint opacity-50"
        >
          <CaretLeft size={14} /> Previous
        </span>
      )}

      <span className="tabular text-sm text-ink-muted">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={hrefForPage(currentPage + 1)}
          className="focus-ring flex items-center gap-1 rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          Next <CaretRight size={14} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className="flex cursor-not-allowed items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-ink-faint opacity-50"
        >
          Next <CaretRight size={14} />
        </span>
      )}
    </nav>
  );
}
