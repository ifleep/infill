"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash } from "@phosphor-icons/react";

export function CouponRowActions({ id, code }: { id: string; code: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete coupon.");
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/coupons/${id}/edit`}
        aria-label={`Edit ${code}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
      >
        <PencilSimple size={16} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${code}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-destructive-tint hover:text-destructive"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
