import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { updateQuoteRequestStatus } from "@/lib/data/quote-requests";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body === "object" && body !== null ? (body as Record<string, unknown>).status : undefined;
  if (status !== "new" && status !== "contacted" && status !== "closed") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const quote = await updateQuoteRequestStatus(id, status);
  return NextResponse.json(quote);
}
