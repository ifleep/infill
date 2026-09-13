import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import { Wordmark } from "@/components/layout/wordmark";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-surface-sunken">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/admin" className="focus-ring flex items-center gap-2">
            <Wordmark />
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Admin</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="focus-ring text-sm font-medium text-ink hover:text-blue-700">
              Products
            </Link>
            <Link
              href="/"
              target="_blank"
              className="focus-ring text-sm font-medium text-ink-muted hover:text-ink"
            >
              View site ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
