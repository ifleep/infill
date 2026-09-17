import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "3D Printers", href: "/category/3d-printers" },
      { label: "Filaments", href: "/category/filament" },
      { label: "Parts & Accessories", href: "/category/parts-accessories" },
      { label: "CNC", href: "/category/machines?sub=CNC" },
      { label: "UV Printers", href: "/category/machines?sub=UV+Printing" },
      { label: "Laser Machines", href: "/category/machines?sub=Laser" },
      { label: "Robots", href: "/category/machines?sub=Robots" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "3D Printing", href: "/services#printing" },
      { label: "Prototyping", href: "/services#prototyping" },
      { label: "Design", href: "/services#design" },
      { label: "Installation", href: "/services#installation" },
      { label: "Training", href: "/services#installation" },
      { label: "Support", href: "/services#support" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "INFiLL Lab", href: "/lab" },
      { label: "Buying Guides", href: "/lab?category=Buying+Guide" },
      { label: "Printer Comparison", href: "/lab?category=Comparison" },
      { label: "Filament Guide", href: "/lab?category=Materials" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/contact?type=support" },
      { label: "Become a Partner", href: "/contact?type=partnership" },
      { label: "Wholesale", href: "/contact?type=partnership" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-on-navy">
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Wordmark inverted />
            <p className="mt-3 max-w-[22ch] text-sm text-on-navy-muted">
              3D Printing &amp; Digital Fabrication
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-navy-muted">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring text-sm text-on-navy hover:text-blue-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-on-navy pt-6 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} INFiLLPK. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal/privacy" className="focus-ring hover:text-on-navy">
              Privacy Policy
            </Link>
            <Link href="/legal/returns" className="focus-ring hover:text-on-navy">
              Returns &amp; Warranty
            </Link>
            <Link href="/legal/shipping" className="focus-ring hover:text-on-navy">
              Shipping
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
