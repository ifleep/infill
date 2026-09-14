import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/customer-auth";

export async function getAllCustomers() {
  return prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerByEmail(email: string) {
  return prisma.customer.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(input: { email: string; password: string; name: string; phone?: string }) {
  const passwordHash = await hashPassword(input.password);
  return prisma.customer.create({
    data: {
      email: input.email.toLowerCase().trim(),
      name: input.name,
      phone: input.phone ?? null,
      passwordHash,
    },
  });
}

export async function getCustomerAddresses(customerId: string) {
  return prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createCustomerAddress(
  customerId: string,
  input: {
    label?: string | null;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    province?: string | null;
    postalCode?: string | null;
    isDefault?: boolean;
  }
) {
  if (input.isDefault) {
    await prisma.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
  }
  return prisma.customerAddress.create({
    data: { customerId, country: "Pakistan", ...input },
  });
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
  await prisma.customerAddress.deleteMany({ where: { id: addressId, customerId } });
}

export async function getCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
