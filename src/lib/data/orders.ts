import { prisma } from "@/lib/db";

// No checkout flow writes real Order rows yet (see requirement #15 — the
// public checkout is intentionally still a mock, since no payment gateway
// is wired up). This is the admin-visibility layer for when it is: the
// schema and this list are ready, they just have nothing to show yet.
export async function getAllOrders() {
  return prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}
