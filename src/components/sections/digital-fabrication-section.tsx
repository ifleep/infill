import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SectionHeading } from "@/components/ui/section-heading";
import { CncIcon, UvPrintingIcon, LaserIcon } from "@/components/icons/tech-icons";

const machines = [
  { label: "CNC", href: "/category/machines?sub=CNC", copy: "Desktop precision machining for wood, plastic and light metals.", Icon: CncIcon },
  { label: "UV Printing", href: "/category/machines?sub=UV+Printing", copy: "Direct-to-object printing for signage and promotional items.", Icon: UvPrintingIcon },
  { label: "Laser", href: "/category/machines?sub=Laser", copy: "Cutting and engraving across wood, acrylic and leather.", Icon: LaserIcon },
];

export function DigitalFabricationSection() {
  return (
    <section className="bg-navy-900 py-16 text-on-navy sm:py-20">
      <div className="container-page">
        <SectionHeading
          inverted
          eyebrow="Beyond 3D Printing"
          title="An expanding fabrication ecosystem."
          description="3D printing remains the core of INFiLLPK. These are the machines that extend what's possible alongside it."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {machines.map(({ label, href, copy, Icon }) => (
            <Link
              key={label}
              href={href}
              className="focus-ring group flex flex-col items-center rounded-xl border border-border-on-navy p-6 text-center transition-colors hover:border-blue-300 hover:bg-white/5"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 text-blue-300 transition-colors group-hover:bg-white/10">
                <Icon size={68} />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold text-on-navy">{label}</h3>
              <p className="mt-2 text-sm text-on-navy-muted">{copy}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-300 opacity-0 transition-opacity group-hover:opacity-100">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
