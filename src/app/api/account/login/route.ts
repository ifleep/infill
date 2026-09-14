import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerByEmail } from "@/lib/data/customers";
import { verifyPassword, createCustomerSessionToken, SESSION_COOKIE_NAME } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";

  const customer = await getCustomerByEmail(email);
  // Same generic error whether the email doesn't exist or the password is
  // wrong — doesn't leak which emails have accounts.
  if (!customer || !customer.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

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
