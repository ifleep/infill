import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getAccessories,
  getCompatibleFilaments,
} from "@/lib/data/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { WishlistToggle } from "@/components/wishlist/wishlist-toggle";
import { AvailabilityStatus } from "@/components/product/availability-badge";
import { LimitedStockBadge } from "@/components/product/limited-stock-badge";
import { SaleTimer } from "@/components/product/sale-timer";
import { SoldCount } from "@/components/product/sold-count";
import { formatPKR } from "@/lib/format";
import { Faq } from "@/components/product/faq";
import { ReviewSection } from "@/components/product/review-section";
import { Star } from "@phosphor-icons/react/ssr";
import type { Product } from "@/lib/types";
import { ContentRenderer } from "@/components/content-blocks/content-renderer";
import { getRedirectTarget } from "@/lib/data/redirects";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const defaultTitle = `${product.brandName} ${product.name}`.trim();
  const title = product.seoTitle || defaultTitle;
  const description = product.metaDescription || product.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || `/products/${product.slug}` },
    robots: product.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: product.ogTitle || title,
      description: product.ogDescription || description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

const statFields: { label: string; get: (p: Product) => string | null }[] = [
  {
    label: "Build volume",
    get: (p) => (p.buildVolume ? `${p.buildVolume.x} × ${p.buildVolume.y} × ${p.buildVolume.z} mm` : null),
  },
  { label: "Max speed", get: (p) => (p.speedMmPerSec ? `${p.speedMmPerSec} mm/s` : null) },
  { label: "Weight", get: (p) => (p.weightKg ? `${p.weightKg} kg` : null) },
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    const target = await getRedirectTarget(`/products/${slug}`);
    if (target) redirect(target);
    notFound();
  }

  const [related, accessories, compatibleFilaments] = await Promise.all([
    getRelatedProducts(product),
    getAccessories(product),
    getCompatibleFilaments(product),
  ]);
  const stats = statFields.map((f) => ({ label: f.label, value: f.get(product) })).filter((s) => s.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brandName },
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability: schemaAvailability(product.availability),
    },
    ...(product.rating && product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://infillpk.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category === "printers" ? "3D Printers" : product.subcategory,
        item: `https://infillpk.com/category/${categorySlugFor(product.category)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://infillpk.com/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-faint">
        <Link href="/" className="focus-ring hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${categorySlugFor(product.category)}`} className="focus-ring hover:text-ink">
          {product.category === "printers" ? "3D Printers" : product.subcategory}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <ProductGallery product={product} />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink-faint">{product.brandName}</p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-ink sm:text-4xl">{product.name}</h1>

          {product.rating && product.reviewCount ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
              <Star size={16} weight="fill" className="text-amber-600" />
              <span className="tabular font-medium text-ink">{product.rating}</span>
              <span>({product.reviewCount} reviews)</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-faint">No reviews yet</p>
          )}

          <p className="mt-4 text-base text-ink-muted">{product.shortDescription}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="tabular text-3xl font-semibold text-ink">{formatPKR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="tabular text-base text-ink-faint line-through">
                {formatPKR(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div className="mt-3">
            <AvailabilityStatus availability={product.availability} stock={product.stock} />
            <LimitedStockBadge product={product} className="mt-1.5" />
            <SaleTimer saleEndsAt={product.saleEndsAt} className="mt-1.5" />
            <SoldCount product={product} className="mt-1.5" />
          </div>

          <AddToCartPanel product={product} brandName={product.brandName} />

          <div className="mt-4 flex flex-wrap gap-2">
            <WishlistToggle productId={product.id} />
            <CompareToggle productId={product.id} />
          </div>

          {stats.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
                  <p className="tabular mt-1 text-sm font-semibold text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Overview</h2>
          {product.contentBlocks && product.contentBlocks.length > 0 ? (
            <div className="mt-4">
              <ContentRenderer blocks={product.contentBlocks} />
            </div>
          ) : (
            <p className="mt-3 max-w-2xl text-ink-muted">{product.description}</p>
          )}

          {product.specifications.length > 0 && !(product.contentBlocks && product.contentBlocks.length > 0) && (
            <>
              <h2 className="font-display mt-10 text-xl font-semibold text-ink">Specifications</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                {product.specifications.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-surface" : "bg-surface-sunken"}`}
                  >
                    <span className="text-ink-muted">{spec.label}</span>
                    <span className="tabular font-medium text-ink">{spec.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {product.materials && product.materials.length > 0 && (
            <>
              <h2 className="font-display mt-10 text-xl font-semibold text-ink">Materials compatibility</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.materials.map((m) => (
                  <span key={m} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {m}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2 className="font-display mt-10 text-xl font-semibold text-ink">FAQs</h2>
          <Faq />

          <ReviewSection productId={product.id} productSlug={product.slug} />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Resources</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Need a manual, spec sheet, or slicer profile for this machine? Our support team can send
              the latest version directly.
            </p>
            <Link
              href="/contact?type=support"
              className="focus-ring mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              Contact Support →
            </Link>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Installation &amp; support</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Installation and training available through our services team.
            </p>
            <Link
              href="/services"
              className="focus-ring mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              View Services →
            </Link>
          </div>
        </div>
      </div>

      {compatibleFilaments.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">Filaments that work with this printer</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {compatibleFilaments.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {accessories.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">Accessories</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold text-ink">Related products</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function schemaAvailability(availability: Product["availability"]) {
  switch (availability) {
    case "in-stock":
      return "https://schema.org/InStock";
    case "preorder":
      return "https://schema.org/PreOrder";
    case "out-of-stock":
      return "https://schema.org/OutOfStock";
  }
}

function categorySlugFor(category: Product["category"]) {
  switch (category) {
    case "printers":
      return "3d-printers";
    case "filament":
      return "filament";
    case "resin":
      return "resin";
    case "parts":
      return "parts-accessories";
    case "machines":
      return "machines";
  }
}
