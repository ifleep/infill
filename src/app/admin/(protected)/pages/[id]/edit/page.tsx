import { notFound } from "next/navigation";
import { getPageById } from "@/lib/data/pages";
import { PageForm } from "@/components/admin/page-form";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {page.title}</h1>
      <PageForm page={page} pageId={page.id} />
    </div>
  );
}
