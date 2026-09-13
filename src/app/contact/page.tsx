import type { Metadata } from "next";
import { Envelope, Phone, MapPin, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with INFiLLPK for sales, technical support, or partnership inquiries.",
};

const channels = [
  {
    icon: Envelope,
    label: "Sales",
    value: "sales@infillpk.com",
    note: "Product questions and orders",
  },
  {
    icon: Phone,
    label: "Support",
    value: "support@infillpk.com",
    note: "Technical help for existing customers",
  },
  {
    icon: WhatsappLogo,
    label: "WhatsApp",
    value: "+92 300 0000000",
    note: "Quick questions, quote requests",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lahore, Pakistan",
    note: "Nationwide shipping",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Get in touch</h1>
      <p className="mt-2 max-w-xl text-ink-muted">
        Sales, support, or a partnership inquiry — tell us what you need and we&rsquo;ll route it to
        the right team.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <ContactForm defaultTopic={type ?? "sales"} />

        <div className="space-y-6">
          {channels.map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <c.icon size={20} className="mt-0.5 shrink-0 text-blue-700" />
              <div>
                <p className="text-sm font-semibold text-ink">{c.label}</p>
                <p className="tabular text-sm text-ink-muted">{c.value}</p>
                <p className="text-xs text-ink-faint">{c.note}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-ink-faint">
            Contact details shown are placeholders pending INFiLLPK&rsquo;s confirmed business
            channels.
          </p>
        </div>
      </div>
    </div>
  );
}
