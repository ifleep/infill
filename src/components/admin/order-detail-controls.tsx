"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function OrderDetailControls({
  orderId,
  orderNumber,
  initialStatus,
  initialPaymentStatus,
  initialNotes,
}: {
  orderId: string;
  orderNumber: string;
  initialStatus: string;
  initialPaymentStatus: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [deleting, setDeleting] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/orders");
    } catch {
      alert("Failed to delete order.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Order status</h2>
          <div className="flex items-center gap-1.5">
            {saveStatus === "saving" && <span className="text-xs text-ink-faint">Saving…</span>}
            {saveStatus === "saved" && <CheckCircle size={16} weight="fill" className="text-pk-green" />}
            {saveStatus === "error" && <WarningCircle size={16} weight="fill" className="text-destructive" />}
          </div>
        </div>

        <label className="block text-xs font-medium text-ink-muted">Status</label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            save({ status: e.target.value });
          }}
          className="focus-ring mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label className="mt-4 block text-xs font-medium text-ink-muted">Payment status</label>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            save({ paymentStatus: e.target.value });
          }}
          className="focus-ring mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-sm"
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>

        <label className="mt-4 block text-xs font-medium text-ink-muted">Internal notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          placeholder="Not shown to the customer — courier tracking number, special instructions, etc."
          className="focus-ring mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-sm placeholder:text-ink-faint"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full border border-border text-destructive hover:bg-destructive-tint"
      >
        {deleting ? "Deleting…" : "Delete order"}
      </Button>
    </div>
  );
}
