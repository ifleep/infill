import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllArticles, createArticle } from "@/lib/data/articles";
import { validateArticleInput } from "@/lib/admin-validate-article";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const result = validateArticleInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const existing = await prisma.article.findUnique({ where: { slug: result.input.slug } });
  if (existing) {
    return NextResponse.json({ error: `An article with slug "${result.input.slug}" already exists.` }, { status: 409 });
  }
  const article = await createArticle(result.input);
  revalidateSite();
  return NextResponse.json(article, { status: 201 });
}
