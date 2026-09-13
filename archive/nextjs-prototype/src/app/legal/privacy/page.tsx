import type { Metadata } from "next";
import { LegalNotice, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Privacy Policy</h1>
      <LegalNotice />
      <LegalSection title="Information we collect">
        Standard order and account information — name, contact details, delivery address, and order
        history — needed to fulfil purchases and provide support.
      </LegalSection>
      <LegalSection title="How we use it">
        To process orders, provide customer support, and communicate about your purchases. We do not
        sell customer data to third parties.
      </LegalSection>
      <LegalSection title="Contact">
        Questions about this policy can be sent to our support team via the Contact page.
      </LegalSection>
    </div>
  );
}
