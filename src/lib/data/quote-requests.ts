import { prisma } from "@/lib/db";

export interface CreateQuoteRequestInput {
  productId?: string | null;
  productName: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export async function createQuoteRequest(input: CreateQuoteRequestInput) {
  return prisma.quoteRequest.create({
    data: {
      productId: input.productId ?? null,
      productName: input.productName,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      message: input.message || null,
      status: "new",
    },
  });
}

export async function getAllQuoteRequests() {
  return prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateQuoteRequestStatus(id: string, status: "new" | "contacted" | "closed") {
  return prisma.quoteRequest.update({ where: { id }, data: { status } });
}
