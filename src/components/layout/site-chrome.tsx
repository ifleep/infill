"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The admin dashboard has its own header/sidebar (see
// src/app/admin/(protected)/layout.tsx) — without this check the public
// marketing chrome (nav, footer, WhatsApp bubble) was rendering around
// every /admin/* page too, since it used to live unconditionally in the
// root layout. header/footer/whatsapp are passed in already-rendered from
// the (server) root layout rather than imported here, since WhatsAppButton
// reads site settings from the DB and can't be instantiated from inside a
// Client Component module.
export function SiteChrome({
  header,
  footer,
  whatsapp,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  whatsapp: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
      {whatsapp}
    </>
  );
}
