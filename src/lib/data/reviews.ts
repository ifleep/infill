import { prisma } from "@/lib/db";

export async function getApprovedReviewsForProduct(productId: string) {
  return prisma.productReview.findMany({
    where: { productId, status: "approved" },
    orderBy: { createdAt: "desc" },
  });
}

export interface CreateReviewInput {
  productId: string;
  customerId: string | null;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
}

// New reviews start "pending" and don't affect the product's displayed
// rating until an admin approves them (see updateReviewStatus) — keeps
// the storefront's rating trustworthy against spam/abuse.
export async function createReview(input: CreateReviewInput) {
  return prisma.productReview.create({
    data: {
      productId: input.productId,
      customerId: input.customerId,
      authorName: input.authorName,
      rating: input.rating,
      title: input.title || null,
      body: input.body || null,
      status: "pending",
    },
  });
}

export async function getAllReviewsAdmin() {
  return prisma.productReview.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function recomputeProductRating(productId: string) {
  const approved = await prisma.productReview.findMany({
    where: { productId, status: "approved" },
    select: { rating: true },
  });
  const reviewCount = approved.length;
  const rating = reviewCount > 0 ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10 : null;
  await prisma.product.update({ where: { id: productId }, data: { rating, reviewCount } });
}

export async function updateReviewStatus(id: string, status: "approved" | "rejected" | "pending") {
  const review = await prisma.productReview.update({ where: { id }, data: { status } });
  await recomputeProductRating(review.productId);
  return review;
}
