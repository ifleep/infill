import { getRecentProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";

// Gives every newly added product a real, server-rendered link from the
// homepage — see getRecentProducts for why this matters for indexing.
const COUNT = 8;

export async function NewArrivalsSection() {
  const recent = await getRecentProducts(COUNT);
  if (recent.length === 0) return null;

  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading eyebrow="New" title="Just landed." />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
