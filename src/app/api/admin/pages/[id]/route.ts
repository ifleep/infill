import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getPageById, updatePage, deletePage } from "@/lib/data/pages";
import { validatePageInput } from "@/lib/admin-validate-page";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { recordSlugRedirect } from "@/lib/data/redirects";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const result = validatePageInput(body, existing.slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (result.input.slug !== existing.slug) {
    const slugTaken = await prisma.page.findUnique({ where: { slug: result.input.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: `A page with slug "${result.input.slug}" already exists.` }, { status: 409 });
    }
  }
  const page = await updatePage(id, result.input);
  if (result.input.slug !== existing.slug) {
    await recordSlugRedirect(`/${existing.slug}`, `/${result.input.slug}`);
  }
  revalidateSite();
  return NextResponse.json(page);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deletePage(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
