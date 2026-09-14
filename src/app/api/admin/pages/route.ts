import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllPages, createPage } from "@/lib/data/pages";
import { validatePageInput } from "@/lib/admin-validate-page";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pages = await getAllPages();
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const result = validatePageInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const existing = await prisma.page.findUnique({ where: { slug: result.input.slug } });
  if (existing) {
    return NextResponse.json({ error: `A page with slug "${result.input.slug}" already exists.` }, { status: 409 });
  }
  const page = await createPage(result.input);
  revalidateSite();
  return NextResponse.json(page, { status: 201 });
}
