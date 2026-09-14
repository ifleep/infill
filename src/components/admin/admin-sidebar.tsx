"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** Pages not built yet (see task list) render as disabled text instead of a dead link. */
  available: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Catalog",
    items: [
      { href: "/admin", label: "Products", available: true },
      { href: "/admin/categories", label: "Categories", available: false },
      { href: "/admin/brands", label: "Brands", available: false },
      { href: "/admin/inventory", label: "Inventory", available: false },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", available: true },
      { href: "/admin/customers", label: "Customers", available: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", available: true },
      { href: "/admin/pages", label: "Pages", available: true },
      { href: "/admin/lab", label: "INFiLL Lab", available: true },
      { href: "/admin/media", label: "Media Library", available: true },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", available: true },
      { href: "/admin/users", label: "Admin Users", available: false },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
              if (!item.available) {
                return (
                  <li key={item.href}>
                    <span
                      className="block cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-ink-faint"
                      title="Coming soon"
                    >
                      {item.label}
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`focus-ring block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-blue-50 text-blue-700" : "text-ink hover:bg-surface-sunken"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
