import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/format";

export class CouponError extends Error {}

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase();
}

interface CouponLike {
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  active: boolean;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  redemptionCount: number;
}

// Pure — takes an already-fetched Coupon row (via `prisma` for the checkout
// preview, or via a transaction client in createOrder, so redemption-count
// checks and increments happen against the same row the order commits
// against) and returns the PKR amount to take off, or throws CouponError
// with a message safe to show the customer.
export function computeCouponDiscount(coupon: CouponLike, subtotal: number): number {
  if (!coupon.active) throw new CouponError("This coupon code is no longer active.");
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new CouponError("This coupon code has expired.");
  }
  if (coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions) {
    throw new CouponError("This coupon code has reached its usage limit.");
  }
  if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) {
    throw new CouponError(`This coupon requires a minimum order of ${formatPKR(coupon.minOrderAmount)}.`);
  }

  let discount =
    coupon.discountType === "percent" ? Math.round((subtotal * coupon.discountValue) / 100) : coupon.discountValue;
  if (coupon.maxDiscountAmount !== null) discount = Math.min(discount, coupon.maxDiscountAmount);
  return Math.max(0, Math.min(discount, subtotal));
}

// Checkout "Apply" button only — previews the discount before the order is
// placed. createOrder() re-fetches and re-validates the coupon itself
// inside its transaction rather than trusting this result, so a stale
// preview (cart changed, code expired in the meantime) can't change what's
// actually charged.
export async function previewCouponDiscount(rawCode: string, subtotal: number) {
  const code = normalizeCouponCode(rawCode);
  if (!code) throw new CouponError("Enter a coupon code.");

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) throw new CouponError("This coupon code isn't valid.");

  const discountAmount = computeCouponDiscount(coupon, subtotal);
  return { code: coupon.code, discountAmount };
}
