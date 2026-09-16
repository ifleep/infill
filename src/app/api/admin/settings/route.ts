import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/data/settings";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import type { PrintMaterial } from "@/lib/print-estimate";
import { revalidateSite } from "@/lib/revalidate";

function parseHeroImages(input: unknown): BlockImageRef[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const images: BlockImageRef[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.url !== "string" || !r.url.trim()) continue;
    images.push({
      mediaId: typeof r.mediaId === "string" ? r.mediaId : "",
      url: r.url,
      alt: typeof r.alt === "string" ? r.alt : "",
      caption: typeof r.caption === "string" ? r.caption : undefined,
    });
  }
  return images;
}

function parsePrintMaterials(input: unknown): PrintMaterial[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const materials: PrintMaterial[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.name !== "string" || !r.name.trim()) continue;
    const densityGCm3 = Number(r.densityGCm3);
    const pricePerKgPkr = Number(r.pricePerKgPkr);
    if (!Number.isFinite(densityGCm3) || densityGCm3 <= 0) continue;
    if (!Number.isFinite(pricePerKgPkr) || pricePerKgPkr < 0) continue;
    materials.push({ name: r.name.trim(), densityGCm3, pricePerKgPkr });
  }
  return materials;
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
    storeNotificationEmail?: string;
    heroImages?: BlockImageRef[];
    reviewVideoUrl?: string;
    reviewVideoCaption?: string;
    printMaterials?: PrintMaterial[];
    printSupportOverheadPercent?: number;
    printServiceFeePkr?: number;
  } = {};
  if (typeof b.whatsappNumber === "string") patch.whatsappNumber = b.whatsappNumber.replace(/[^0-9]/g, "");
  if (typeof b.whatsappMessage === "string") patch.whatsappMessage = b.whatsappMessage;
  if (typeof b.storeNotificationEmail === "string") patch.storeNotificationEmail = b.storeNotificationEmail.trim();
  const heroImages = parseHeroImages(b.heroImages);
  if (heroImages) patch.heroImages = heroImages;
  if (typeof b.reviewVideoUrl === "string") patch.reviewVideoUrl = b.reviewVideoUrl.trim();
  if (typeof b.reviewVideoCaption === "string") patch.reviewVideoCaption = b.reviewVideoCaption.trim();
  const printMaterials = parsePrintMaterials(b.printMaterials);
  if (printMaterials) patch.printMaterials = printMaterials;
  if (typeof b.printSupportOverheadPercent === "number" && b.printSupportOverheadPercent >= 0) {
    patch.printSupportOverheadPercent = Math.round(b.printSupportOverheadPercent);
  }
  if (typeof b.printServiceFeePkr === "number" && b.printServiceFeePkr >= 0) {
    patch.printServiceFeePkr = Math.round(b.printServiceFeePkr);
  }

  await updateSiteSettings(patch);
  revalidateSite();
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}
