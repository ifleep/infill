import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { getUsedMediaRefs, isMediaUnused } from "@/lib/data/media-usage";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data: { alt?: string | null; caption?: string | null } = {};
  if ("alt" in body) data.alt = typeof body.alt === "string" ? body.alt : null;
  if ("caption" in body) data.caption = typeof body.caption === "string" ? body.caption : null;

  const media = await prisma.media.update({ where: { id }, data });
  revalidateSite();
  return NextResponse.json(media);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Checks every place a Media item can be referenced — product galleries,
  // brand logos, article featured images, og:image fields, content-block
  // images, homepage sections and site settings — not just product
  // galleries (see getUsedMediaRefs for why a single combined check).
  const used = await getUsedMediaRefs();
  if (!isMediaUnused(media, used)) {
    const usageCount = await prisma.productMedia.count({ where: { mediaId: id } });
    return NextResponse.json(
      {
        error:
          usageCount > 0
            ? `This image is used by ${usageCount} product${usageCount === 1 ? "" : "s"} — remove it from ${
                usageCount === 1 ? "that product" : "those products"
              } first.`
            : "This image is still referenced elsewhere on the site (a brand logo, article, homepage section, or content block) — remove it from there first.",
      },
      { status: 409 }
    );
  }

  await prisma.media.delete({ where: { id } });

  // Best-effort — an already-missing file shouldn't fail the API call.
  if (media.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", "uploads", media.url.slice("/uploads/".length));
    await unlink(filePath).catch(() => {});
  }

  revalidateSite();
  return NextResponse.json({ ok: true });
}
