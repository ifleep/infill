import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { PrintCalculator } from "@/components/print-calculator/print-calculator";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Instant 3D Printing Price Calculator",
  description:
    "Upload your STL, OBJ, or G-code file and get an instant 3D printing price in Pakistan, in PLA, ABS, PETG, TPU and more. No signup, no waiting for a reply.",
};

export default async function PrintPriceCalculatorPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <section className="bg-navy-900 py-16 text-on-navy sm:py-20">
        <div className="container-page">
          <SectionHeading
            inverted
            eyebrow="Instant Quote"
            title="Get your 3D printing price right now."
            description="Upload your file below and see what it costs to print, in every material we offer. No signup, no waiting for a reply — just an instant estimate."
          />
        </div>
      </section>
      <section className="container-page py-16 sm:py-20">
        <PrintCalculator
          materials={settings.printMaterials}
          supportOverheadPercent={settings.printSupportOverheadPercent}
          serviceFeePkr={settings.printServiceFeePkr}
        />
      </section>
    </div>
  );
}
