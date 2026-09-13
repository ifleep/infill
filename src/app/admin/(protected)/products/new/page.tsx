import { brands } from "@/lib/data/brands";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Add Product</h1>
      <ProductForm brands={brands} />
    </div>
  );
}
