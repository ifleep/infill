import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { createDatabaseBackup } from "@/lib/backup";

// Manual "download a backup right now" — separate from the scheduled
// /api/cron/backup endpoint, which delivers off-server automatically.
export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, json } = await createDatabaseBackup();
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
