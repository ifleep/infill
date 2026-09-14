import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { createReview } from "@/lib/data/reviews";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { getCustomerById } from "@/lib/data/customers";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const rating = Number(b.rating);
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 120) : undefined;
  const reviewBody = typeof b.body === "string" ? b.body.trim().slice(0, 2000) : undefined;
  let authorName = typeof b.authorName === "string" ? b.authorName.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const customerId = await getCurrentCustomerId();
  if (customerId) {
    const customer = await getCustomerById(customerId);
    authorName = customer?.name || authorName || "Verified Buyer";
  }
  if (!authorName) return NextResponse.json({ error: "Enter your name." }, { status: 400 });

  await createReview({ productId: product.id, customerId, authorName, rating, title, body: reviewBody });

  return NextResponse.json({ ok: true, message: "Thanks — your review is awaiting moderation." }, { status: 201 });
}
