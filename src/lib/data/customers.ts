import { prisma } from "@/lib/db";

// No customer registration flow exists yet (requirement #16 — architecture
// only, using an insecure homemade auth scheme was explicitly ruled out).
// This is the admin-visibility layer for when it does.
export async function getAllCustomers() {
  return prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
}
