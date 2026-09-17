"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

export function CategoryForm({
  categoryId,
  initial,
  options,
}: {
  categoryId?: string;
  initial?: { name: string; slug: string; parentId: string | null };
  /** Every other category, for the parent picker — excludes this category itself when editing (can't be its own parent). */
  options: { id: string; name: string }[];
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [parentId, setParentId] = useState(initial?.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories", {
        method: categoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, parentId: parentId || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-xl border border-border bg-surface p-6">
      {error && <p className="rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">
          Name <span className="text-destructive">*</span>
        </span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">URL slug</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">Leave blank to auto-generate from the name.</span>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Parent category</span>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
          <option value="">None — top level</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : categoryId ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
