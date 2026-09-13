import { getAllProducts } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import { AdminProductTable } from "@/components/admin/admin-product-table";
import { LinkButton } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {products.length} products. Price, sale price, stock and availability save
            automatically as you edit them.
          </p>
        </div>
        <LinkButton href="/admin/products/new">Add Product</LinkButton>
      </div>

      <AdminProductTable initialProducts={products} brands={brands} />
    </div>
  );
}
