import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Add Article</h1>
      <ArticleForm />
    </div>
  );
}
