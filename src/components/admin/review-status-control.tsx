"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["pending", "approved", "rejected"] as const;

export function ReviewStatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <select
      value={status}
      disabled={saving}
      onChange={async (e) => {
        setSaving(true);
        await fetch(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        });
        setSaving(false);
        router.refresh();
      }}
      className="focus-ring rounded-md border border-border-strong px-2 py-1 text-xs capitalize text-ink"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
