import type { Metadata } from "next";
import { LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Returns & Warranty" };

export default function ReturnsPage() {
  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Returns &amp; Warranty</h1>
      <LegalSection title="Returns">
        Unopened, unused items in original packaging can be returned within a reasonable window of
        delivery. Contact support to start a return.
      </LegalSection>
      <LegalSection title="Warranty">
        You have 3 days from delivery to check your product and report any manufacturing defects or
        hardware faults — contact support within this window for a repair, replacement, or refund.
        Consumable parts (nozzles, build surfaces, belts) and damage from misuse are not covered.
      </LegalSection>
      <LegalSection title="Damaged on arrival">
        Contact support within 48 hours of delivery with photos of the damage, and we&rsquo;ll arrange
        a replacement or refund.
      </LegalSection>
    </div>
  );
}
