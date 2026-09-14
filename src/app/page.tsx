import { CinematicHero } from "@/components/hero/cinematic-hero";
import { PrintingDiscoverySection } from "@/components/sections/printing-discovery-section";
import { FindYourPrinterSection } from "@/components/sections/find-your-printer-section";
import { FeaturedPrintersSection } from "@/components/sections/featured-printers-section";
import { HomepagePromoSections } from "@/components/sections/homepage-promo-sections";
import { MaterialsSection } from "@/components/sections/materials-section";
import { DigitalFabricationSection } from "@/components/sections/digital-fabrication-section";
import { ServicesSection } from "@/components/sections/services-section";
import { LearnSection } from "@/components/sections/learn-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { RegionalMotifEdge } from "@/components/patterns/regional-motif-edge";
import { getProductsByCategory } from "@/lib/data/products";

export default async function Home() {
  const printers = await getProductsByCategory("printers");

  return (
    <>
      <RegionalMotifEdge motif="sindh" side="left" />
      <RegionalMotifEdge motif="punjab" side="right" />
      <CinematicHero />
      <PrintingDiscoverySection />
      <FindYourPrinterSection printers={printers} />
      <FeaturedPrintersSection />
      <HomepagePromoSections />
      <MaterialsSection />
      <DigitalFabricationSection />
      <ServicesSection />
      <LearnSection />
      <FinalCtaSection />
    </>
  );
}
