import { prisma } from "@/lib/db";
import type { Page as PageRow } from "@/generated/prisma/client";
import { parseContentBlocks, type ContentBlock } from "@/lib/content-blocks/types";
import type { Prisma } from "@/generated/prisma/client";

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  contentBlocks: ContentBlock[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex: boolean;
}

function fromRow(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status as Page["status"],
    contentBlocks: parseContentBlocks(row.contentBlocks),
    seoTitle: row.seoTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    ogTitle: row.ogTitle ?? undefined,
    ogDescription: row.ogDescription ?? undefined,
    noindex: row.noindex,
  };
}

// Public: only ever returns published pages — a draft 404s on the public site.
export async function getPublishedPageBySlug(slug: string): Promise<Page | null> {
  const row = await prisma.page.findUnique({ where: { slug } });
  if (!row || row.status !== "published") return null;
  return fromRow(row);
}

export async function getAllPublishedPages(): Promise<Page[]> {
  const rows = await prisma.page.findMany({ where: { status: "published" } });
  return rows.map(fromRow);
}

// Admin
export async function getAllPages(): Promise<Page[]> {
  const rows = await prisma.page.findMany({ orderBy: { title: "asc" } });
  return rows.map(fromRow);
}

export async function getPageById(id: string): Promise<Page | null> {
  const row = await prisma.page.findUnique({ where: { id } });
  return row ? fromRow(row) : null;
}

export interface PageInput {
  slug: string;
  title: string;
  status: "draft" | "published";
  contentBlocks: ContentBlock[];
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  noindex: boolean;
}

function toDbInput(input: PageInput) {
  return {
    slug: input.slug,
    title: input.title,
    status: input.status,
    contentBlocks: input.contentBlocks as unknown as Prisma.InputJsonValue,
    seoTitle: input.seoTitle,
    metaDescription: input.metaDescription,
    canonicalUrl: input.canonicalUrl,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    noindex: input.noindex,
  };
}

export async function createPage(input: PageInput): Promise<Page> {
  const row = await prisma.page.create({ data: toDbInput(input) });
  return fromRow(row);
}

export async function updatePage(id: string, input: PageInput): Promise<Page> {
  const row = await prisma.page.update({ where: { id }, data: toDbInput(input) });
  return fromRow(row);
}

export async function deletePage(id: string): Promise<void> {
  await prisma.page.delete({ where: { id } });
}
