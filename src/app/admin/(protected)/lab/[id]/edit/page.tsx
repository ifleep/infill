import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/data/articles";
import { getProductsByIds } from "@/lib/data/products";
import { ArticleForm } from "@/components/admin/article-form";
import type { PickableProduct } from "@/components/admin/product-picker";
import type { Product } from "@/lib/types";

function toPickable(p: Product): PickableProduct {
  return { id: p.id, name: p.name, slug: p.slug, brandName: p.brandName, price: p.price, image: p.images[0] };
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const relatedProducts = await getProductsByIds(article.relatedProductIds ?? [], { includeHidden: true });

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit {article.title}</h1>
      <ArticleForm article={article} articleId={article.id} relatedProducts={relatedProducts.map(toPickable)} />
    </div>
  );
}
