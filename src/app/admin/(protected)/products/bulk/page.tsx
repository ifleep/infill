import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { BulkProductForm } from "@/components/admin/bulk-product-form";

export default async function BulkAddProductsPage() {
  const brands = await getAllBrandsAdmin();
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Bulk Add Products</h1>
      <BulkProductForm brands={brands} />
    </div>
  );
}
