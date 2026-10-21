import { NextResponse } from "next/server";
import { previewCouponDiscount, CouponError } from "@/lib/data/coupons";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const code = typeof b.code === "string" ? b.code : "";
  const subtotal = typeof b.subtotal === "number" ? b.subtotal : NaN;
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  try {
    const result = await previewCouponDiscount(code, subtotal);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Coupon validation failed:", err);
    return NextResponse.json({ error: "Something went wrong checking that code." }, { status: 500 });
  }
}
