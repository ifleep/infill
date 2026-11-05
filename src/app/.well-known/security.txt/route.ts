// RFC 9116 security.txt — tells a security researcher where to report a
// vulnerability instead of them guessing or going public with it first.
// Reuses the real support inbox already published on /contact rather than
// inventing a dedicated security@ address that doesn't exist yet.
export function GET() {
  const body = [
    "Contact: mailto:support@infillpk.com",
    "Expires: 2027-11-05T00:00:00.000Z",
    "Preferred-Languages: en",
    "Canonical: https://infillpk.com/.well-known/security.txt",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
