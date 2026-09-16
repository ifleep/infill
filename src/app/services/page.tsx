import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServicesSection } from "@/components/sections/services-section";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "3D Printing Services in Pakistan",
  description:
    "Get your parts 3D printed in Pakistan — upload your file for an instant price, or get help with design, prototyping, installation and support.",
};

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-navy-900 py-16 text-on-navy sm:py-20">
        <div className="container-page">
          <SectionHeading
            inverted
            eyebrow="3D Printing Services"
            title="Need something 3D printed? We'll print it for you."
            description="Upload your file and get an instant price online. Not sure where to start? We can help with the design too."
          />
          <LinkButton href="/print-price-calculator" size="lg" className="mt-6">
            Get an instant price
          </LinkButton>
        </div>
      </section>
      <ServicesSection />
    </div>
  );
}
