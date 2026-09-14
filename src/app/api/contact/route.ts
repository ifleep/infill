import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data/settings";
import { sendEmail } from "@/lib/notifications/email";

const topicLabels: Record<string, string> = {
  sales: "Sales inquiry",
  support: "Technical support",
  partnership: "Business / partnership",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const topic = typeof b.topic === "string" ? b.topic : "sales";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const settings = await getSiteSettings();
  if (settings.storeNotificationEmail) {
    await sendEmail(
      settings.storeNotificationEmail,
      `New contact message — ${topicLabels[topic] ?? topic}`,
      `<h2>${topicLabels[topic] ?? topic}</h2>
       <p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
       <p>${message.replace(/\n/g, "<br/>")}</p>`
    ).catch((err) => console.error("Contact notification failed:", err));
  }

  return NextResponse.json({ ok: true });
}
