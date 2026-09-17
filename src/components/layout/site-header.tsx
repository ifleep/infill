"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Heart,
  Scales,
  ShoppingBag,
  User,
  List,
  CaretDown,
} from "@phosphor-icons/react";
import { Wordmark } from "@/components/layout/wordmark";
import { megaMenus, simpleNavLinks } from "@/components/layout/nav-data";
import { SearchOverlay } from "@/components/search/search-overlay";
import { useCartCount, useCartStore } from "@/components/cart/cart-store";
import { useWishlistCount } from "@/components/wishlist/wishlist-store";
import { useCompareCount } from "@/components/compare/compare-store";
import { LinkButton } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartCount();
  const openCart = useCartStore((s) => s.open);
  const wishlistCount = useWishlistCount();
  const compareCount = useCompareCount();

  const activeMenu = megaMenus.find((m) => m.label === openMenu);

  return (
    <>
      <header className="sticky top-0 z-80 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="container-page flex h-14 items-center gap-6 lg:h-16">
          <button
            className="focus-ring cursor-pointer p-1 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <List size={24} />
          </button>

          <Link href="/" className="focus-ring shrink-0">
            <Wordmark />
          </Link>

          <nav
            className="relative hidden flex-1 items-center justify-center gap-1 self-stretch lg:flex"
            onMouseLeave={() => setOpenMenu(null)}
          >
            {megaMenus.map((menu) => (
              <Link
                key={menu.label}
                href={menu.href}
                onMouseEnter={() => setOpenMenu(menu.label)}
                onFocus={() => setOpenMenu(menu.label)}
                className="focus-ring flex cursor-pointer items-center gap-1 rounded px-3.5 py-2 text-sm font-medium text-ink hover:text-blue-700"
                aria-expanded={openMenu === menu.label}
              >
                {menu.label}
                <CaretDown size={12} weight="bold" />
              </Link>
            ))}
            {simpleNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="focus-ring rounded px-3.5 py-2 text-sm font-medium text-ink hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}

            {activeMenu && (
              <div
                className="absolute left-1/2 top-full z-70 w-[min(92vw,720px)] -translate-x-1/2 rounded-b-xl border border-t-0 border-border bg-surface p-6 shadow-xl"
                onMouseEnter={() => setOpenMenu(activeMenu.label)}
              >
                <div className="grid grid-cols-4 gap-6">
                  {activeMenu.columns.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        {col.heading}
                      </p>
                      <ul className="space-y-2.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              onClick={() => setOpenMenu(null)}
                              className="focus-ring text-sm text-ink hover:text-blue-700"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    href={activeMenu.viewAllHref}
                    onClick={() => setOpenMenu(null)}
                    className="focus-ring text-sm font-medium text-blue-700 hover:text-blue-600"
                  >
                    {activeMenu.viewAllLabel} →
                  </Link>
                </div>
              </div>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="focus-ring cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken"
            >
              <MagnifyingGlass size={20} />
            </button>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
              className="focus-ring relative hidden cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken sm:block"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/compare"
              aria-label={`Compare, ${compareCount} item${compareCount === 1 ? "" : "s"}`}
              className="focus-ring relative hidden cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken sm:block"
            >
              <Scales size={20} />
              {compareCount > 0 && (
                <span className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="focus-ring hidden cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken sm:block"
            >
              <User size={20} />
            </Link>
            <button
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              onClick={openCart}
              className="focus-ring relative cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="ml-2 hidden xl:block">
              <LinkButton href="/contact?type=quote" size="sm">
                Get a Quote
              </LinkButton>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
