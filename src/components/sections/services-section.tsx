import Link from "next/link";
import { Printer, Cube, PencilRuler, Wrench, Headset } from "@phosphor-icons/react/ssr";
import { services } from "@/lib/data/services";
import { SectionHeading } from "@/components/ui/section-heading";

const icons = [Printer, Cube, PencilRuler, Wrench, Headset];

export function ServicesSection() {
  return (
    <section id="services" className="container-page py-20 sm:py-28">
      <SectionHeading
        eyebrow="Services"
        title="From idea to object."
        description="We don't just sell machines. We help you use them."
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((svc, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div
              key={svc.id}
              id={svc.id.replace("svc-", "")}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <Icon size={22} className="text-blue-700" />
              <h3 className="font-display mt-3 text-base font-semibold text-ink">{svc.headline}</h3>
              <p className="mt-2 text-sm text-ink-muted">{svc.description}</p>
              <ul className="mt-4 space-y-1.5">
                {svc.bullets.map((b) => (
                  <li key={b} className="text-xs text-ink-muted before:mr-1.5 before:text-blue-700 before:content-['—']">
                    {b}
                  </li>
                ))}
              </ul>
              {svc.id === "svc-printing" && (
                <Link
                  href="/print-price-calculator"
                  className="focus-ring mt-4 inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-600"
                >
                  Get an instant price →
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <Link
        href="/services"
        className="focus-ring mt-8 inline-flex text-sm font-medium text-blue-700 hover:text-blue-600"
      >
        Learn more about our services →
      </Link>
    </section>
  );
}
