import dns from "node:dns/promises";
import net from "node:net";

export class UnsafeUrlError extends Error {}

// Private/loopback/link-local/reserved ranges — a URL resolving into any of
// these is refused before fetching. This is a reasonable-effort guard for
// an admin-only "fetch a link the admin gives us" feature (the threat model
// here is a trusted admin pasting a real manufacturer link, not an
// attacker-controlled input) — it checks the resolved IP once up front, so
// it doesn't defend against DNS-rebinding between this check and the actual
// fetch. Good enough for this feature; not a substitute for a hardened
// outbound proxy if this ever became a less-trusted, public-facing path.
function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateOrReservedIp(lower.slice(7));
    return false;
  }
  return true; // Couldn't classify it — refuse rather than guess.
}

/** Validates the URL is a plain http(s) link that doesn't resolve to a private/internal address. Throws UnsafeUrlError otherwise. */
export async function assertSafeExternalUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeUrlError("Only http/https links are supported.");
  }
  let address: string;
  try {
    address = (await dns.lookup(parsed.hostname)).address;
  } catch {
    throw new UnsafeUrlError("Couldn't resolve that address.");
  }
  if (isPrivateOrReservedIp(address)) {
    throw new UnsafeUrlError("That address can't be reached.");
  }
  return parsed;
}

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Fetches a URL already validated by assertSafeExternalUrl, with a timeout and a realistic User-Agent (some sites block the default fetch one). */
export async function fetchExternal(url: URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, headers: { "User-Agent": USER_AGENT, ...init?.headers } });
  } finally {
    clearTimeout(timeout);
  }
}
