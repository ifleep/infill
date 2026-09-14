import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCustomer, getCustomerByEmail } from "@/lib/data/customers";
import { createCustomerSessionToken, SESSION_COOKIE_NAME } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : undefined;

  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await getCustomerByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists — try signing in instead." }, { status: 409 });
  }

  const customer = await createCustomer({ email, password, name, phone });

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createCustomerSessionToken(customer.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
