import { notFound } from "next/navigation";
import { getCouponAdminById } from "@/lib/data/coupons-admin";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await getCouponAdminById(id);
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Edit Coupon</h1>
      <CouponForm
        couponId={coupon.id}
        initial={{
          code: coupon.code,
          discountType: coupon.discountType as "percent" | "fixed",
          discountValue: coupon.discountValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
          minOrderAmount: coupon.minOrderAmount,
          maxRedemptions: coupon.maxRedemptions,
          active: coupon.active,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
        }}
      />
    </div>
  );
}
