import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { getCategoryOptions } from "@/lib/data/categories-admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [brands, categoryOptions] = await Promise.all([getAllBrandsAdmin(), getCategoryOptions()]);
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Add Product</h1>
      <ProductForm brands={brands} categoryOptions={categoryOptions} />
    </div>
  );
}
