import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/data/settings";
import { revalidateSite } from "@/lib/revalidate";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const patch: { whatsappNumber?: string; whatsappMessage?: string } = {};
  if (typeof b.whatsappNumber === "string") patch.whatsappNumber = b.whatsappNumber.replace(/[^0-9]/g, "");
  if (typeof b.whatsappMessage === "string") patch.whatsappMessage = b.whatsappMessage;

  await updateSiteSettings(patch);
  revalidateSite();
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}
