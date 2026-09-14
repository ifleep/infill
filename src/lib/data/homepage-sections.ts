import { prisma } from "@/lib/db";
import type { HomepageSection as HomepageSectionRow, Prisma } from "@/generated/prisma/client";
import type { HomepageSection, HomepageSectionType, PromoBannerConfig, PromoImageConfig } from "@/lib/content-blocks/homepage-types";

function toJsonInput(config: PromoBannerConfig | PromoImageConfig): Prisma.InputJsonValue {
  return config as unknown as Prisma.InputJsonValue;
}

function fromRow(row: HomepageSectionRow): HomepageSection {
  return {
    id: row.id,
    type: row.type as HomepageSectionType,
    title: row.title,
    config: row.config as unknown as PromoBannerConfig | PromoImageConfig,
    enabled: row.enabled,
    position: row.position,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
  };
}

// Public: only sections that are enabled AND within their optional
// start/end window — a scheduled promo simply won't render outside its
// dates, no admin action needed at either end.
export async function getActiveHomepageSections(): Promise<HomepageSection[]> {
  const now = new Date();
  const rows = await prisma.homepageSection.findMany({
    where: {
      enabled: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { position: "asc" },
  });
  return rows.map(fromRow);
}

// Admin: every section regardless of schedule/enabled state.
export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  const rows = await prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
  return rows.map(fromRow);
}

export interface HomepageSectionInput {
  type: HomepageSectionType;
  title: string | null;
  config: PromoBannerConfig | PromoImageConfig;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export async function createHomepageSection(input: HomepageSectionInput): Promise<HomepageSection> {
  const maxPosition = await prisma.homepageSection.aggregate({ _max: { position: true } });
  const row = await prisma.homepageSection.create({
    data: {
      type: input.type,
      title: input.title,
      config: toJsonInput(input.config),
      enabled: input.enabled,
      position: (maxPosition._max.position ?? -1) + 1,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
    },
  });
  return fromRow(row);
}

export async function updateHomepageSection(id: string, input: HomepageSectionInput): Promise<HomepageSection> {
  const row = await prisma.homepageSection.update({
    where: { id },
    data: {
      type: input.type,
      title: input.title,
      config: toJsonInput(input.config),
      enabled: input.enabled,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
    },
  });
  return fromRow(row);
}

export async function deleteHomepageSection(id: string): Promise<void> {
  await prisma.homepageSection.delete({ where: { id } });
}

export async function reorderHomepageSections(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(orderedIds.map((id, position) => prisma.homepageSection.update({ where: { id }, data: { position } })));
}
