import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { getCategoryOptions } from "@/lib/data/categories-admin";
import { getSiteSettings } from "@/lib/data/settings";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [brands, categoryOptions, settings] = await Promise.all([
    getAllBrandsAdmin(),
    getCategoryOptions(),
    getSiteSettings(),
  ]);
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Add Product</h1>
      <ProductForm
        brands={brands}
        categoryOptions={categoryOptions}
        siteDefaultPreorderLeadDays={settings.preorderLeadTimeDays}
      />
    </div>
  );
}
