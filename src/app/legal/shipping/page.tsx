import type { Metadata } from "next";
import { LegalNotice, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Shipping</h1>
      <LegalNotice />
      <LegalSection title="Coverage">
        We ship nationwide across all provinces and territories of Pakistan, including Gilgit-Baltistan
        and Azad Jammu &amp; Kashmir.
      </LegalSection>
      <LegalSection title="Delivery times">
        Standard items typically ship within a few business days. Large or industrial equipment may
        require freight arrangements — our team will confirm timing after checkout.
      </LegalSection>
      <LegalSection title="Shipping cost">
        A flat shipping rate is calculated at checkout based on your order. Large machines may require
        a custom freight quote.
      </LegalSection>
    </div>
  );
}
