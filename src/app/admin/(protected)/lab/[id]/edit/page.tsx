import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/data/articles";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {article.title}</h1>
      <ArticleForm article={article} articleId={article.id} />
    </div>
  );
}
