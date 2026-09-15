import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { runAndDeliverBackup } from "@/lib/backup";

// Hit this on a schedule (Hostinger hPanel > Advanced > Cron Jobs, or any
// external uptime/cron service) to back up the database automatically —
// see .env.example for BACKUP_CRON_SECRET and the recommended schedule.
// Token-secured rather than session-secured since cron jobs can't hold an
// admin login session; timing-safe comparison so the secret can't be
// brute-forced via response-time differences.
export async function GET(request: Request) {
  const secret = process.env.BACKUP_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "BACKUP_CRON_SECRET is not configured." }, { status: 503 });
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { delivered, result } = await runAndDeliverBackup();
  return NextResponse.json({ ok: true, delivered, filename: result.filename, sizeBytes: result.sizeBytes });
}
