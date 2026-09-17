"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

const faqs = [
  {
    q: "What's included in the box?",
    a: "The machine itself, the standard accessory kit listed by the manufacturer, and a printed quick-start guide. A full accessory list is available on request before you order.",
  },
  {
    q: "Do you offer installation and training?",
    a: "Yes — installation, calibration and hands-on operator training are available as a paid service, on-site in major cities or remotely elsewhere in Pakistan.",
  },
  {
    q: "What if my order arrives faulty or damaged?",
    a: "Contact our support team and we'll sort out a repair, replacement or refund. Full details are on our Returns & Warranty page.",
  },
  {
    q: "Can I pay in installments or request a quote for bulk orders?",
    a: "For institutional, bulk or industrial orders, contact our sales team for a formal quote — pricing and terms can be adjusted for volume.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-4 divide-y divide-border rounded-lg border border-border">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {faqs.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="focus-ring flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-ink"
          >
            {item.q}
            <CaretDown size={14} className={`shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-4 pb-4 text-sm text-ink-muted">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
