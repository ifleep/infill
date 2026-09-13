import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";

export async function FeaturedPrintersSection() {
  const featured = (await getFeaturedProducts()).filter((p) => p.category === "printers");

  return (
    <section className="container-page py-20 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Featured" title="Start shopping." />
        <Link
          href="/category/3d-printers"
          className="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex"
        >
          View all printers <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
