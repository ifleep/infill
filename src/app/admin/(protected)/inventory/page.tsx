import { getAllProducts } from "@/lib/data/products";
import { getAllBrandsAdmin } from "@/lib/data/brands-admin";
import { InventoryTable } from "@/components/admin/inventory-table";

export default async function AdminInventoryPage() {
  const [products, brands] = await Promise.all([getAllProducts(), getAllBrandsAdmin()]);

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Inventory</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Stock and low-stock threshold for every product, in one place. Stock is also editable from each
        product&rsquo;s own page — this view is for spotting what needs restocking.
      </p>

      <InventoryTable initialProducts={products} brands={brands} />
    </div>
  );
}
