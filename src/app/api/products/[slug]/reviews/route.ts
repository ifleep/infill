import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { createReview } from "@/lib/data/reviews";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { getCustomerById } from "@/lib/data/customers";
import { validateAndStoreImage, MediaValidationError } from "@/lib/admin/media-storage";

const MAX_PHOTOS_PER_REVIEW = 4;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rating = Number(formData.get("rating"));
  const title = typeof formData.get("title") === "string" ? String(formData.get("title")).trim().slice(0, 120) : undefined;
  const reviewBody =
    typeof formData.get("body") === "string" ? String(formData.get("body")).trim().slice(0, 2000) : undefined;
  let authorName = typeof formData.get("authorName") === "string" ? String(formData.get("authorName")).trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const customerId = await getCurrentCustomerId();
  if (customerId) {
    const customer = await getCustomerById(customerId);
    authorName = customer?.name || authorName || "Verified Buyer";
  }
  if (!authorName) return NextResponse.json({ error: "Enter your name." }, { status: 400 });

  const photoFiles = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length > MAX_PHOTOS_PER_REVIEW) {
    return NextResponse.json({ error: `Attach at most ${MAX_PHOTOS_PER_REVIEW} photos.` }, { status: 400 });
  }

  const photoUrls: string[] = [];
  for (const file of photoFiles) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const { url } = await validateAndStoreImage(bytes, file.name, file.type);
      photoUrls.push(url);
    } catch (err) {
      const message = err instanceof MediaValidationError ? err.message : "Couldn't process one of your photos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  await createReview({ productId: product.id, customerId, authorName, rating, title, body: reviewBody, photoUrls });

  return NextResponse.json({ ok: true, message: "Thanks — your review is awaiting moderation." }, { status: 201 });
}
