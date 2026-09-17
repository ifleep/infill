import { notFound } from "next/navigation";
import { getCategoryAdminById, getCategoryOptions } from "@/lib/data/categories-admin";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, allOptions] = await Promise.all([getCategoryAdminById(id), getCategoryOptions()]);
  if (!category) notFound();

  // A category can't be its own parent — leave it out of the picker.
  const options = allOptions.filter((o) => o.id !== id);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit Category</h1>
      <CategoryForm
        categoryId={id}
        initial={{ name: category.name, slug: category.slug, parentId: category.parentId }}
        options={options}
      />
    </div>
  );
}
