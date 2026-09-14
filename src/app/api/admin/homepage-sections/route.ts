import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllHomepageSections, createHomepageSection } from "@/lib/data/homepage-sections";
import { validateHomepageSectionInput } from "@/lib/admin-validate-homepage-section";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sections = await getAllHomepageSections();
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const result = validateHomepageSectionInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const section = await createHomepageSection(result.input);
  revalidateSite();
  return NextResponse.json(section, { status: 201 });
}
