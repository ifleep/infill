import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { reorderHomepageSections } from "@/lib/data/homepage-sections";
import { revalidateSite } from "@/lib/revalidate";

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const ids = body && typeof body === "object" ? (body as { ids?: unknown }).ids : null;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "Expected { ids: string[] }." }, { status: 400 });
  }
  await reorderHomepageSections(ids);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
