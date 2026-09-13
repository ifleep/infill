import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServicesSection } from "@/components/sections/services-section";

export const metadata: Metadata = {
  title: "Services",
  description: "3D printing services, prototyping, design, installation, training and support from INFiLLPK.",
};

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-navy-900 py-16 text-on-navy sm:py-20">
        <div className="container-page">
          <SectionHeading inverted title="We don't just sell machines. We help you use them." />
        </div>
      </section>
      <ServicesSection />
    </div>
  );
}
