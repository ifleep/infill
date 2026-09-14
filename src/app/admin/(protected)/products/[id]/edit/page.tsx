import { notFound } from "next/navigation";
import { getProductAdminById } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductAdminById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {product.name}</h1>
      <ProductForm brands={brands} product={product} mediaItems={product.mediaItems} productId={product.id} />
    </div>
  );
}
