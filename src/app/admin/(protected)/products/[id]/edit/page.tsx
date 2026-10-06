import { notFound } from "next/navigation";
import { getProductAdminById, getRelatedProducts, getAccessories } from "@/lib/data/products";
import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { getCategoryOptions } from "@/lib/data/categories-admin";
import { getSiteSettings } from "@/lib/data/settings";
import { ProductForm } from "@/components/admin/product-form";
import type { PickableProduct } from "@/components/admin/product-picker";
import type { Product } from "@/lib/types";

function toPickable(p: Product): PickableProduct {
  return { id: p.id, name: p.name, slug: p.slug, brandName: p.brandName, price: p.price, image: p.images[0] };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categoryOptions, settings] = await Promise.all([
    getProductAdminById(id),
    getAllBrandsAdmin(),
    getCategoryOptions(),
    getSiteSettings(),
  ]);
  if (!product) notFound();

  const [relatedProducts, accessoryProducts] = await Promise.all([
    getRelatedProducts(product, { includeHidden: true }),
    getAccessories(product, { includeHidden: true }),
  ]);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {product.name}</h1>
      <ProductForm
        brands={brands}
        categoryOptions={categoryOptions}
        product={product}
        mediaItems={product.mediaItems}
        productId={product.id}
        preorderLeadDaysOverride={product.preorderLeadDaysOverride}
        siteDefaultPreorderLeadDays={settings.preorderLeadTimeDays}
        relatedProducts={relatedProducts.map(toPickable)}
        accessoryProducts={accessoryProducts.map(toPickable)}
      />
    </div>
  );
}
