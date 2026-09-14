import { prisma } from "@/lib/db";
import type { Article } from "@/lib/types";
import { parseContentBlocks, type ContentBlock } from "@/lib/content-blocks/types";
import type { Article as ArticleRow, Media as MediaRow, Prisma } from "@/generated/prisma/client";

function jsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

type ArticleWithMedia = ArticleRow & { featuredImage: MediaRow | null };

const articleInclude = { featuredImage: true } satisfies Prisma.ArticleInclude;

function fromRow(row: ArticleWithMedia): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: (row.category as Article["category"]) ?? "Technology",
    readingMinutes: row.readingMinutes ?? 4,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString().slice(0, 10),
    contentBlocks: parseContentBlocks(row.contentBlocks),
    author: row.author ?? undefined,
    featuredImageUrl: row.featuredImage?.url,
    status: row.status as Article["status"],
    relatedProductIds: row.relatedProductIds ? jsonStringArray(row.relatedProductIds) : undefined,
    seoTitle: row.seoTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    ogTitle: row.ogTitle ?? undefined,
    ogDescription: row.ogDescription ?? undefined,
    noindex: row.noindex,
  };
}

// ---------------------------------------------------------------- Public reads

export async function getPublishedArticles(): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    include: articleInclude,
  });
  return rows.map(fromRow);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { slug }, include: articleInclude });
  if (!row || row.status !== "published") return null;
  return fromRow(row);
}

// ---------------------------------------------------------------- Admin

export async function getAllArticles(): Promise<Article[]> {
  const rows = await prisma.article.findMany({ orderBy: { createdAt: "desc" }, include: articleInclude });
  return rows.map(fromRow);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { id }, include: articleInclude });
  return row ? fromRow(row) : null;
}

export interface ArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  category: Article["category"];
  readingMinutes: number;
  publishedAt: string | null;
  contentBlocks: ContentBlock[];
  author: string | null;
  featuredImageId: string | null;
  status: Article["status"];
  relatedProductIds: string[];
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  noindex: boolean;
}

function toDbInput(input: ArticleInput) {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    readingMinutes: input.readingMinutes,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "published" ? new Date() : null,
    contentBlocks: input.contentBlocks as unknown as Prisma.InputJsonValue,
    author: input.author,
    featuredImageId: input.featuredImageId,
    status: input.status,
    relatedProductIds: input.relatedProductIds,
    seoTitle: input.seoTitle,
    metaDescription: input.metaDescription,
    canonicalUrl: input.canonicalUrl,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    noindex: input.noindex,
  };
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const row = await prisma.article.create({ data: toDbInput(input), include: articleInclude });
  return fromRow(row);
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const row = await prisma.article.update({ where: { id }, data: toDbInput(input), include: articleInclude });
  return fromRow(row);
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({ where: { id } });
}
