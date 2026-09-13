import Link from "next/link";
import { ArrowRight, Drop, Package } from "@phosphor-icons/react/ssr";
import { SectionHeading } from "@/components/ui/section-heading";

const materialGroups = [
  { label: "PLA", href: "/category/filament?sub=PLA", copy: "Easy, reliable, the default starting point." },
  { label: "PETG", href: "/category/filament?sub=PETG", copy: "Tougher and more moisture-resistant than PLA." },
  { label: "ABS / ASA", href: "/category/filament?sub=ABS", copy: "Heat and impact resistance for demanding parts." },
  { label: "TPU", href: "/category/filament?sub=TPU", copy: "Flexible material for gaskets and wearables." },
  { label: "Nylon & Engineering", href: "/category/filament?sub=Nylon", copy: "Stiffness and heat resistance for functional parts." },
  { label: "Resin", href: "/category/resin", copy: "Fine detail for miniatures, masters and dental work." },
];

export function MaterialsSection() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Materials"
          title="Materials matter."
          description="Printers get the attention, but materials are what most customers come back for."
        />
        <Link
          href="/category/filament"
          className="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex"
        >
          View all materials <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {materialGroups.map((m, i) => (
          <Link
            key={m.label}
            href={m.href}
            className="focus-ring group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {i === materialGroups.length - 1 ? (
              <Drop size={22} className="text-blue-700" />
            ) : (
              <Package size={22} className="text-blue-700" />
            )}
            <h3 className="mt-3 text-sm font-semibold text-ink">{m.label}</h3>
            <p className="mt-1 text-xs text-ink-muted">{m.copy}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border-strong bg-surface-sunken p-5 text-sm text-ink-muted">
        <span className="font-medium text-ink">INFiLL Filament</span> — our own material line is in
        development. For now, we carry established and OEM filament brands.
      </div>
    </section>
  );
}
