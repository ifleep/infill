import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CartProvider } from "@/components/cart/cart-store";
import { WishlistProvider } from "@/components/wishlist/wishlist-store";
import { CompareProvider } from "@/components/compare/compare-store";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

// Self-hosted rather than next/font/google: the production build on
// Hostinger fetches Google Fonts' CSS + binary files at build time, and
// that fetch has failed there before (build 01a1104a, "next/font/google
// queries have exactly one entry" / unresolved font module), breaking the
// whole deploy over a network call that has nothing to do with the app
// itself. These are the same latin-subset variable-weight files Google
// Fonts was serving (fetched once, vendored in src/app/fonts/), so nothing
// about the rendered site changes — the build just no longer depends on
// reaching fonts.gstatic.com.
const outfit = localFont({
  src: "./fonts/outfit-variable-latin.woff2",
  variable: "--font-outfit",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-variable-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const siteUrl = "https://infillpk.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "INFiLLPK — 3D Printing & Digital Fabrication for Pakistan",
    template: "%s | INFiLLPK",
  },
  description:
    "3D printers, filament, resin, parts and digital fabrication equipment for Pakistan — plus printing services, prototyping, design, installation and training. Make it real.",
  keywords: [
    "3D printer Pakistan",
    "buy 3D printer Pakistan",
    "3D printer price Pakistan",
    "PLA filament Pakistan",
    "PETG filament Pakistan",
    "resin 3D printer Pakistan",
    "CNC machine Pakistan",
    "UV printer Pakistan",
    "laser cutting machine Pakistan",
    "robotics Pakistan",
    "3D printing service Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "INFiLLPK",
    title: "INFiLLPK — 3D Printing & Digital Fabrication for Pakistan",
    description:
      "Modern 3D printing and digital fabrication technology for Pakistan. Machines, materials, and the expertise to use them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "INFiLLPK — 3D Printing & Digital Fabrication for Pakistan",
    description:
      "Modern 3D printing and digital fabrication technology for Pakistan.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    // SVG first for browsers that support it; PNG fallbacks for Google
    // Search and anything that doesn't render SVG favicons reliably.
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Set GOOGLE_SITE_VERIFICATION once you add the site in Google Search
  // Console (Settings → Ownership verification → HTML tag → copy just the
  // content="..." value, not the whole tag).
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "INFiLLPK",
  url: siteUrl,
  description:
    "Modern 3D printing and digital fabrication technology for Pakistan — printers, materials, parts, and the services to use them.",
  areaServed: "PK",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <GoogleAnalytics />
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded focus-visible:bg-blue-900 focus-visible:px-4 focus-visible:py-2 focus-visible:text-white"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <SiteChrome header={<SiteHeader />} footer={<SiteFooter />} whatsapp={<WhatsAppButton />}>
                {children}
              </SiteChrome>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
