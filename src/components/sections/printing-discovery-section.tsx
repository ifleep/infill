import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  FdmIcon,
  ResinIcon,
  CoreXYIcon,
  LargeFormatIcon,
  IndustrialIcon,
  EducationalIcon,
} from "@/components/icons/tech-icons";

const technologies = [
  { label: "FDM / FFF", href: "/category/3d-printers?tech=FDM", copy: "The everyday workhorse — accessible, versatile, and material-rich.", Icon: FdmIcon },
  { label: "Resin", href: "/category/3d-printers?tech=Resin", copy: "Fine detail and smooth surface finish for miniatures and masters.", Icon: ResinIcon },
  { label: "CoreXY", href: "/category/3d-printers?tech=CoreXY", copy: "Enclosed, high-speed motion systems built for volume.", Icon: CoreXYIcon },
  { label: "Large Format", href: "/category/3d-printers?tech=Large+Format", copy: "For parts — and ambitions — that outgrow a standard bed.", Icon: LargeFormatIcon },
  { label: "Industrial", href: "/category/3d-printers?tech=Industrial", copy: "Production-grade reliability for continuous duty.", Icon: IndustrialIcon },
  { label: "Educational", href: "/category/3d-printers?tech=Educational", copy: "Built for classrooms, labs, and first-time makers.", Icon: EducationalIcon },
];

export function PrintingDiscoverySection() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="3D Printing"
          title="One technology. Many ways to build."
          description="From a first desktop printer to an enclosed production system, the right technology depends on what you're actually making."
        />
        <Link
          href="/category/3d-printers"
          className="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex"
        >
          View all 3D printers <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technologies.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="focus-ring group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <t.Icon size={24} className="text-blue-700" />
            <h3 className="font-display mt-3 text-lg font-semibold text-ink">{t.label}</h3>
            <p className="mt-2 text-sm text-ink-muted">{t.copy}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100">
              Explore <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/category/3d-printers"
        className="focus-ring mt-8 flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:hidden"
      >
        View all 3D printers <ArrowRight size={16} />
      </Link>
    </section>
  );
}
