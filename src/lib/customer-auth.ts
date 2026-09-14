import crypto from "node:crypto";
import { cookies } from "next/headers";

// Customer-facing auth — separate cookie/session from /admin's (see
// src/lib/admin-auth.ts), same HMAC-signed-token approach, but the payload
// carries a real customerId since (unlike the single shared admin login)
// there are many customers. Passwords are hashed with Node's built-in
// scrypt (salt:hash hex, no extra dependency) rather than compared as
// plaintext like the admin password is.
export const SESSION_COOKIE_NAME = "infillpk_customer_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to your environment (see .env.example).");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return resolve(false);
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.length === expected.length && crypto.timingSafeEqual(derivedKey, expected));
    });
  });
}

export function createCustomerSessionToken(customerId: string): string {
  const payload = Buffer.from(JSON.stringify({ customerId, exp: Date.now() + SESSION_TTL_MS })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token: string | undefined | null): { customerId: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const { customerId, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof customerId !== "string" || typeof exp !== "number" || exp <= Date.now()) return null;
    return { customerId };
  } catch {
    return null;
  }
}

/** For Server Components / API routes — the logged-in customer's id, or null. */
export async function getCurrentCustomerId(): Promise<string | null> {
  const store = await cookies();
  const parsed = parseSessionToken(store.get(SESSION_COOKIE_NAME)?.value);
  return parsed?.customerId ?? null;
}
