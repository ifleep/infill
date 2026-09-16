import { notFound } from "next/navigation";
import { getBrandAdminById } from "@/lib/data/brands-admin";
import { BrandForm } from "@/components/admin/brand-form";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getBrandAdminById(id);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit Brand</h1>
      <BrandForm
        brandId={id}
        initial={{
          name: brand.name,
          slug: brand.slug,
          country: brand.country ?? "",
          description: brand.description ?? "",
          logoMediaId: brand.logoMediaId,
          logoUrl: brand.logo?.url ?? null,
        }}
      />
    </div>
  );
}
