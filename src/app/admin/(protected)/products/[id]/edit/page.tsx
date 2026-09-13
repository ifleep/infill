import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {product.name}</h1>
      <ProductForm brands={brands} product={product} productId={product.id} />
    </div>
  );
}
