import { prisma } from "@/lib/db";
import { normalizeCouponCode } from "@/lib/data/coupons";

export interface CouponInput {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  maxRedemptions: number | null;
  active: boolean;
  expiresAt: Date | null;
}

export async function getAllCouponsAdmin() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCouponAdminById(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function findCouponByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code: normalizeCouponCode(code) } });
}

export async function createCoupon(input: CouponInput) {
  return prisma.coupon.create({ data: input });
}

export async function updateCoupon(id: string, input: CouponInput) {
  return prisma.coupon.update({ where: { id }, data: input });
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
}

export function parseCouponInput(body: unknown): { input: CouponInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const code = typeof b.code === "string" ? normalizeCouponCode(b.code) : "";
  if (!code) return { error: "Code is required." };

  const discountType = b.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(b.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Enter a discount value greater than 0." };
  }
  if (discountType === "percent" && discountValue > 100) {
    return { error: "A percentage discount can't be more than 100." };
  }

  const maxDiscountAmount =
    discountType === "percent" && b.maxDiscountAmount !== "" && b.maxDiscountAmount != null
      ? Number(b.maxDiscountAmount)
      : null;
  if (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)) {
    return { error: "Max discount amount must be a positive number." };
  }

  const minOrderAmount = b.minOrderAmount !== "" && b.minOrderAmount != null ? Number(b.minOrderAmount) : null;
  if (minOrderAmount !== null && (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)) {
    return { error: "Minimum order amount must be a positive number." };
  }

  const maxRedemptions = b.maxRedemptions !== "" && b.maxRedemptions != null ? Number(b.maxRedemptions) : null;
  if (maxRedemptions !== null && (!Number.isFinite(maxRedemptions) || maxRedemptions <= 0)) {
    return { error: "Usage limit must be a positive whole number." };
  }

  const active = typeof b.active === "boolean" ? b.active : true;

  let expiresAt: Date | null = null;
  if (typeof b.expiresAt === "string" && b.expiresAt) {
    const parsed = new Date(b.expiresAt);
    if (Number.isNaN(parsed.getTime())) return { error: "Invalid expiry date." };
    expiresAt = parsed;
  }

  return {
    input: {
      code,
      discountType,
      discountValue: Math.floor(discountValue),
      maxDiscountAmount: maxDiscountAmount !== null ? Math.floor(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount !== null ? Math.floor(minOrderAmount) : null,
      maxRedemptions: maxRedemptions !== null ? Math.floor(maxRedemptions) : null,
      active,
      expiresAt,
    },
  };
}
