import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

// Next's own built-in 404 fallback doesn't merge cleanly with the root
// layout's title template, producing a garbled concatenated title — a real
// not-found.tsx gets normal metadata handling instead.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">404</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-ink sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton href="/">Go home</LinkButton>
        <Link href="/category/3d-printers" className="focus-ring text-sm font-medium text-blue-700 hover:text-blue-600">
          Browse 3D Printers
        </Link>
      </div>
    </div>
  );
}
