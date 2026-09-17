"use client";

import Link from "next/link";
import { useState } from "react";
import { X, CaretRight, Heart, Scales } from "@phosphor-icons/react";
import { Wordmark } from "@/components/layout/wordmark";
import { megaMenus, simpleNavLinks } from "@/components/layout/nav-data";
import { useWishlistCount } from "@/components/wishlist/wishlist-store";
import { useCompareCount } from "@/components/compare/compare-store";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const wishlistCount = useWishlistCount();
  const compareCount = useCompareCount();

  return (
    <div
      className={`fixed inset-0 z-110 lg:hidden ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-surface shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Wordmark />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="px-2 py-2">
          {megaMenus.map((menu) => (
            <div key={menu.label}>
              <div className="flex items-center border-b border-border">
                <Link
                  href={menu.href}
                  onClick={onClose}
                  className="focus-ring flex-1 px-3 py-3.5 text-left text-sm font-medium text-ink"
                >
                  {menu.label}
                </Link>
                <button
                  className="focus-ring cursor-pointer p-3.5 text-ink-muted"
                  onClick={() => setExpanded(expanded === menu.label ? null : menu.label)}
                  aria-expanded={expanded === menu.label}
                  aria-label={`${expanded === menu.label ? "Collapse" : "Expand"} ${menu.label}`}
                >
                  <CaretRight
                    size={14}
                    className={`transition-transform ${expanded === menu.label ? "rotate-90" : ""}`}
                  />
                </button>
              </div>
              {expanded === menu.label && (
                <div className="space-y-4 border-b border-border px-3 pb-4 pt-4">
                  {menu.columns.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        {col.heading}
                      </p>
                      <ul className="space-y-1.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="focus-ring block py-1 text-sm text-ink-muted hover:text-blue-700"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link
                    href={menu.viewAllHref}
                    onClick={onClose}
                    className="focus-ring block text-sm font-medium text-blue-700"
                  >
                    {menu.viewAllLabel} →
                  </Link>
                </div>
              )}
            </div>
          ))}
          {simpleNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="focus-ring block border-b border-border px-3 py-3.5 text-sm font-medium text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            onClick={onClose}
            className="focus-ring flex items-center gap-2 border-b border-border px-3 py-3.5 text-sm font-medium text-ink"
          >
            <Heart size={16} />
            Wishlist
            {wishlistCount > 0 && <span className="text-ink-faint">({wishlistCount})</span>}
          </Link>
          <Link
            href="/compare"
            onClick={onClose}
            className="focus-ring flex items-center gap-2 border-b border-border px-3 py-3.5 text-sm font-medium text-ink"
          >
            <Scales size={16} />
            Compare
            {compareCount > 0 && <span className="text-ink-faint">({compareCount})</span>}
          </Link>
          <Link
            href="/contact?type=quote"
            onClick={onClose}
            className="focus-ring block px-3 py-3.5 text-sm font-medium text-blue-700"
          >
            Get a Quote
          </Link>
        </nav>
      </div>
    </div>
  );
}
