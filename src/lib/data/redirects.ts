import { prisma } from "@/lib/db";

// Called whenever a product/page/article's slug changes — so a link or
// search result pointing at the old URL 301s to the new one instead of
// 404ing. Collapses chains: anything that already redirected to the old
// path gets repointed straight at the new one, rather than A→B→C.
export async function recordSlugRedirect(fromPath: string, toPath: string): Promise<void> {
  if (fromPath === toPath) return;
  await prisma.redirect.updateMany({ where: { toPath: fromPath }, data: { toPath } });
  await prisma.redirect.upsert({
    where: { fromPath },
    create: { fromPath, toPath },
    update: { toPath },
  });
}

export async function getRedirectTarget(fromPath: string): Promise<string | null> {
  const row = await prisma.redirect.findUnique({ where: { fromPath } });
  return row?.toPath ?? null;
}
