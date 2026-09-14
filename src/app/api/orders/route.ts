import { NextResponse } from "next/server";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { createOrder, OrderError, type CheckoutLineInput } from "@/lib/data/orders";
import { sendOrderNotifications } from "@/lib/notifications/order";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  const address = typeof b.address === "string" ? b.address.trim() : "";
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const province = typeof b.province === "string" ? b.province.trim() : "";
  const paymentMethod = b.paymentMethod === "bank" ? "bank" : "cod";
  const lines = Array.isArray(b.lines) ? (b.lines as unknown[]) : [];

  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (phone.length < 7) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!fullName || !address || !city || !province) {
    return NextResponse.json({ error: "Fill in your full delivery address." }, { status: 400 });
  }

  const parsedLines: CheckoutLineInput[] = [];
  for (const raw of lines) {
    if (typeof raw !== "object" || raw === null) continue;
    const l = raw as Record<string, unknown>;
    if (typeof l.productId === "string" && typeof l.quantity === "number") {
      parsedLines.push({ productId: l.productId, quantity: Math.floor(l.quantity) });
    }
  }

  try {
    const customerId = await getCurrentCustomerId();
    const order = await createOrder({
      customerId,
      guestEmail: email,
      guestPhone: phone,
      address: { fullName, phone, address, city, province },
      paymentMethod,
      lines: parsedLines,
    });

    await sendOrderNotifications(order, email).catch((err) => {
      // Notification failures shouldn't fail an already-placed order —
      // the order and its stock decrement are already committed.
      console.error("Order notification failed:", err);
    });

    return NextResponse.json({ orderNumber: order.orderNumber, total: order.total });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Something went wrong placing your order. Please try again." }, { status: 500 });
  }
}
