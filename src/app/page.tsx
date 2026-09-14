import { CinematicHero } from "@/components/hero/cinematic-hero";
import { PrintingDiscoverySection } from "@/components/sections/printing-discovery-section";
import { FindYourPrinterSection } from "@/components/sections/find-your-printer-section";
import { FeaturedPrintersSection } from "@/components/sections/featured-printers-section";
import { HomepagePromoSections } from "@/components/sections/homepage-promo-sections";
import { MaterialsSection } from "@/components/sections/materials-section";
import { DigitalFabricationSection } from "@/components/sections/digital-fabrication-section";
import { PakistanMapSection } from "@/components/pakistan/pakistan-map-section";
import { ServicesSection } from "@/components/sections/services-section";
import { LearnSection } from "@/components/sections/learn-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { getProductsByCategory } from "@/lib/data/products";

export default async function Home() {
  const printers = await getProductsByCategory("printers");

  return (
    <>
      <CinematicHero />
      <PrintingDiscoverySection />
      <FindYourPrinterSection printers={printers} />
      <FeaturedPrintersSection />
      <HomepagePromoSections />
      <MaterialsSection />
      <DigitalFabricationSection />
      <PakistanMapSection />
      <ServicesSection />
      <LearnSection />
      <FinalCtaSection />
    </>
  );
}
