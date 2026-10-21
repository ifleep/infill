import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAllCouponsAdmin, createCoupon, findCouponByCode, parseCouponInput } from "@/lib/data/coupons-admin";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllCouponsAdmin());
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const result = parseCouponInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const existing = await findCouponByCode(result.input.code);
  if (existing) {
    return NextResponse.json({ error: `A coupon with code "${result.input.code}" already exists.` }, { status: 409 });
  }
  const coupon = await createCoupon(result.input);
  return NextResponse.json(coupon, { status: 201 });
}
