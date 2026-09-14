import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/site-chrome";
import { CartProvider } from "@/components/cart/cart-store";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    icon: "/favicon.svg",
  },
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
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded focus-visible:bg-blue-900 focus-visible:px-4 focus-visible:py-2 focus-visible:text-white"
        >
          Skip to main content
        </a>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
