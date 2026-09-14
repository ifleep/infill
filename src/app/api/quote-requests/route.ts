import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data/products";
import { createQuoteRequest } from "@/lib/data/quote-requests";
import { getSiteSettings } from "@/lib/data/settings";
import { sendEmail } from "@/lib/notifications/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : undefined;
  const message = typeof b.message === "string" ? b.message.trim() : undefined;
  const productSlug = typeof b.productSlug === "string" ? b.productSlug.trim() : undefined;
  const fallbackProductName = typeof b.productName === "string" ? b.productName.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (phone.length < 7) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });

  const product = productSlug ? await getProductBySlug(productSlug) : null;
  const productName = product?.name ?? fallbackProductName;
  if (!productName) {
    return NextResponse.json({ error: "Let us know which product you're asking about." }, { status: 400 });
  }

  const quote = await createQuoteRequest({
    productId: product?.id ?? null,
    productName,
    name,
    phone,
    email,
    message,
  });

  const settings = await getSiteSettings();
  if (settings.storeNotificationEmail) {
    await sendEmail(
      settings.storeNotificationEmail,
      `New quote request — ${productName}`,
      `<h2>New quote request</h2>
       <p><strong>Product:</strong> ${productName}</p>
       <p><strong>Name:</strong> ${name}<br/><strong>Phone:</strong> ${phone}${email ? `<br/><strong>Email:</strong> ${email}` : ""}</p>
       ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}`
    ).catch((err) => console.error("Quote notification failed:", err));
  }

  return NextResponse.json({ ok: true, id: quote.id });
}
