import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/data/articles";
import { validateArticleInput } from "@/lib/admin-validate-article";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const result = validateArticleInput(body, existing.slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (result.input.slug !== existing.slug) {
    const slugTaken = await prisma.article.findUnique({ where: { slug: result.input.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: `An article with slug "${result.input.slug}" already exists.` }, { status: 409 });
    }
  }
  const article = await updateArticle(id, result.input);
  revalidateSite();
  return NextResponse.json(article);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteArticle(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
