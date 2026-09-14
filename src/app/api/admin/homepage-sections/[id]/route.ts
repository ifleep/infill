import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { updateHomepageSection, deleteHomepageSection } from "@/lib/data/homepage-sections";
import { validateHomepageSectionInput } from "@/lib/admin-validate-homepage-section";
import { revalidateSite } from "@/lib/revalidate";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = validateHomepageSectionInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const section = await updateHomepageSection(id, result.input);
  revalidateSite();
  return NextResponse.json(section);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteHomepageSection(id);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
