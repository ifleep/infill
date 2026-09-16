import { HomepageHero } from "@/components/hero/homepage-hero";
import { PrintingDiscoverySection } from "@/components/sections/printing-discovery-section";
import { FindYourPrinterSection } from "@/components/sections/find-your-printer-section";
import { FeaturedPrintersSection } from "@/components/sections/featured-printers-section";
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

export default async function Home() {
  const [printers, settings] = await Promise.all([getProductsByCategory("printers"), getSiteSettings()]);

  return (
    <>
      <RegionalMotifEdge motif="sindh" side="left" />
      <RegionalMotifEdge motif="punjab" side="right" />
      <HomepageHero heroImages={settings.heroImages} />
      <PrintingDiscoverySection />
      <FindYourPrinterSection printers={printers} />
      <FeaturedPrintersSection />
      <ReviewVideoCard />
      <HomepagePromoSections />
      <MaterialsSection />
      <DigitalFabricationSection />
      <ServicesSection />
      <LearnSection />
      <FinalCtaSection />
    </>
  );
}
