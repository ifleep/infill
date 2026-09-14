import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings, type ShippingRate } from "@/lib/data/settings";
import { revalidateSite } from "@/lib/revalidate";

function parseShippingRates(input: unknown): ShippingRate[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const rates: ShippingRate[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.city !== "string" || !r.city.trim() || typeof r.cost !== "number") continue;
    rates.push({
      city: r.city.trim(),
      cost: Math.max(0, Math.round(r.cost)),
      etaDays: typeof r.etaDays === "number" ? Math.max(1, Math.round(r.etaDays)) : undefined,
    });
  }
  return rates;
}

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
  const patch: {
    whatsappNumber?: string;
    whatsappMessage?: string;
    shippingRates?: ShippingRate[];
    defaultShippingCost?: number;
    storeNotificationEmail?: string;
  } = {};
  if (typeof b.whatsappNumber === "string") patch.whatsappNumber = b.whatsappNumber.replace(/[^0-9]/g, "");
  if (typeof b.whatsappMessage === "string") patch.whatsappMessage = b.whatsappMessage;
  const shippingRates = parseShippingRates(b.shippingRates);
  if (shippingRates) patch.shippingRates = shippingRates;
  if (typeof b.defaultShippingCost === "number") patch.defaultShippingCost = Math.max(0, Math.round(b.defaultShippingCost));
  if (typeof b.storeNotificationEmail === "string") patch.storeNotificationEmail = b.storeNotificationEmail.trim();

  await updateSiteSettings(patch);
  revalidateSite();
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}
