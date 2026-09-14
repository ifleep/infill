import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { updateReviewStatus } from "@/lib/data/reviews";
import { revalidateSite } from "@/lib/revalidate";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body === "object" && body !== null ? (body as Record<string, unknown>).status : undefined;
  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const review = await updateReviewStatus(id, status);
  revalidateSite();
  return NextResponse.json(review);
}
