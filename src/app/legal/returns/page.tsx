import type { Metadata } from "next";
import { LegalNotice, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Returns & Warranty" };

export default function ReturnsPage() {
  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Returns &amp; Warranty</h1>
      <LegalNotice />
      <LegalSection title="Returns">
        Unopened, unused items in original packaging can be returned within a reasonable window of
        delivery. Contact support to start a return.
      </LegalSection>
      <LegalSection title="Warranty">
        Each product page lists its manufacturer warranty period, covering defects under normal use.
        Consumable parts (nozzles, build surfaces, belts) are not covered.
      </LegalSection>
      <LegalSection title="Damaged on arrival">
        Contact support within 48 hours of delivery with photos of the damage, and we&rsquo;ll arrange
        a replacement or refund.
      </LegalSection>
    </div>
  );
}
