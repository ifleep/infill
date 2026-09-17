import { notFound } from "next/navigation";
import { getProductAdminById } from "@/lib/data/products";
import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { getCategoryOptions } from "@/lib/data/categories-admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categoryOptions] = await Promise.all([
    getProductAdminById(id),
    getAllBrandsAdmin(),
    getCategoryOptions(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {product.name}</h1>
      <ProductForm
        brands={brands}
        categoryOptions={categoryOptions}
        product={product}
        mediaItems={product.mediaItems}
        productId={product.id}
      />
    </div>
  );
}
