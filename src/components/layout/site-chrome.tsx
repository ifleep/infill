"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

// The admin dashboard has its own header/sidebar (see
// src/app/admin/(protected)/layout.tsx) — without this check the public
// marketing chrome (nav, footer, WhatsApp bubble) was rendering around
// every /admin/* page too, since it used to live unconditionally in the
// root layout.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
