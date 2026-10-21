import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import {
  getCouponAdminById,
  updateCoupon,
  deleteCoupon,
  findCouponByCode,
  parseCouponInput,
} from "@/lib/data/coupons-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await getCouponAdminById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const result = parseCouponInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.input.code !== existing.code) {
    const codeTaken = await findCouponByCode(result.input.code);
    if (codeTaken) {
      return NextResponse.json({ error: `A coupon with code "${result.input.code}" already exists.` }, { status: 409 });
    }
  }

  const coupon = await updateCoupon(id, result.input);
  return NextResponse.json(coupon);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await getCouponAdminById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
