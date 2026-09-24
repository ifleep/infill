import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const VALID_STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const VALID_PAYMENT_STATUS = ["unpaid", "paid", "refunded"];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const data: { status?: string; paymentStatus?: string; notes?: string | null } = {};
  if (b.status !== undefined) {
    if (typeof b.status !== "string" || !VALID_STATUS.includes(b.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = b.status;
  }
  if (b.paymentStatus !== undefined) {
    if (typeof b.paymentStatus !== "string" || !VALID_PAYMENT_STATUS.includes(b.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    }
    data.paymentStatus = b.paymentStatus;
  }
  if (b.notes !== undefined) {
    data.notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;
  }

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: true, customer: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
