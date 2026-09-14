"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash } from "@phosphor-icons/react";

export function PageRowActions({ id, title }: { id: string; title: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Failed to delete page.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/pages/${id}/edit`}
        aria-label={`Edit ${title}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken"
      >
        <PencilSimple size={16} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${title}`}
        className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-destructive-tint hover:text-destructive"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
