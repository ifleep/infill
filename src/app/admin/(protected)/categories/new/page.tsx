import { getCategoryOptions } from "@/lib/data/categories-admin";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const options = await getCategoryOptions();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Add Category</h1>
      <CategoryForm options={options} />
    </div>
  );
}
