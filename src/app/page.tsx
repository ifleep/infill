import { HomepageHero } from "@/components/hero/homepage-hero";
import { InstantQuoteSection } from "@/components/sections/instant-quote-section";
import { PrintingDiscoverySection } from "@/components/sections/printing-discovery-section";
import { FindYourPrinterSection } from "@/components/sections/find-your-printer-section";
import { FeaturedPrintersSection } from "@/components/sections/featured-printers-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { ReviewVideoCard } from "@/components/sections/review-video-card";
import { HomepagePromoSections } from "@/components/sections/homepage-promo-sections";
import { MaterialsSection } from "@/components/sections/materials-section";
import { DigitalFabricationSection } from "@/components/sections/digital-fabrication-section";
import { ServicesSection } from "@/components/sections/services-section";
import { LearnSection } from "@/components/sections/learn-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { RegionalMotifEdge } from "@/components/patterns/regional-motif-edge";
import { getProductsByCategory } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/settings";

// Without this, the homepage is cached indefinitely (Next's default for a
// route with no request-time APIs) and only regenerates on-demand via
// revalidateSite() after an admin edit — see src/lib/revalidate.ts. That
// on-demand call reaches this app's own server correctly, but anything
// sitting in front of it (a CDN, a host-level page cache) that isn't told
// about the edit has no reason to stop serving what it already cached, since
// Next's default Cache-Control for an unbounded-static page is
// s-maxage=31536000 (one year). Capping revalidation here means any such
// layer that respects standard cache headers self-corrects within a minute
// instead of holding a stale homepage (featured products, promo banner)
// forever. See node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md.
export const revalidate = 60;

export default async function Home() {
  const [printers, settings] = await Promise.all([getProductsByCategory("printers"), getSiteSettings()]);

  return (
    <>
      <RegionalMotifEdge motif="sindh" side="left" />
      <RegionalMotifEdge motif="punjab" side="right" />
      <HomepageHero heroImages={settings.heroImages} heroImagesMobile={settings.heroImagesMobile} />
      <FeaturedPrintersSection />
      <NewArrivalsSection />
      <ReviewVideoCard />
      <HomepagePromoSections />
      <InstantQuoteSection
        materials={settings.printMaterials}
        supportOverheadPercent={settings.printSupportOverheadPercent}
        serviceFeePkr={settings.printServiceFeePkr}
      />
      <MaterialsSection />
      <PrintingDiscoverySection />
      <FindYourPrinterSection printers={printers} />
      <DigitalFabricationSection />
      <ServicesSection />
      <LearnSection />
      <FinalCtaSection />
    </>
  );
}
