import { CinematicHero } from "@/components/hero/cinematic-hero";
import { PrintingDiscoverySection } from "@/components/sections/printing-discovery-section";
import { FindYourPrinterSection } from "@/components/sections/find-your-printer-section";
import { FeaturedPrintersSection } from "@/components/sections/featured-printers-section";
import { MaterialsSection } from "@/components/sections/materials-section";
import { DigitalFabricationSection } from "@/components/sections/digital-fabrication-section";
import { PakistanMapSection } from "@/components/pakistan/pakistan-map-section";
import { ServicesSection } from "@/components/sections/services-section";
import { LearnSection } from "@/components/sections/learn-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export default function Home() {
  return (
    <>
      <CinematicHero />
      <PrintingDiscoverySection />
      <FindYourPrinterSection />
      <FeaturedPrintersSection />
      <MaterialsSection />
      <DigitalFabricationSection />
      <PakistanMapSection />
      <ServicesSection />
      <LearnSection />
      <FinalCtaSection />
    </>
  );
}
