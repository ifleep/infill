"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["new", "contacted", "closed"] as const;

export function QuoteStatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <select
      value={status}
      disabled={saving}
      onChange={async (e) => {
        setSaving(true);
        await fetch(`/api/admin/quote-requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        });
        setSaving(false);
        router.refresh();
      }}
      className="select-arrow focus-ring rounded-md border border-border-strong py-1 pl-2 text-xs capitalize text-ink"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
