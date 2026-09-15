export interface EmailAttachment {
  filename: string;
  /** Raw file bytes — base64-encoded before sending, per Resend's API. */
  content: Buffer;
}

// Sends via Resend's HTTP API directly (no SDK dependency, same style as
// the rest of the codebase). Silently no-ops if RESEND_API_KEY isn't set,
// so local dev and deployments without an email provider configured yet
// keep working — the calling flow (an order, a quote request) still
// completes, it just isn't emailed.
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(attachments?.length
        ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })) }
        : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend API responded ${res.status}: ${await res.text().catch(() => "")}`);
  }
}
