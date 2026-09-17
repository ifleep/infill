"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash } from "@phosphor-icons/react";

export function BrandRowActions({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete brand.");
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to delete brand.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/brands/${id}/edit`}
        aria-label={`Edit ${name}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
      >
        <PencilSimple size={16} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${name}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-destructive-tint hover:text-destructive"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
