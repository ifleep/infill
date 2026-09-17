"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import type { MediaItem } from "@/lib/admin/media-types";

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

export function BrandForm({
  brandId,
  initial,
}: {
  brandId?: string;
  initial?: { name: string; slug: string; country: string; description: string; logoMediaId: string | null; logoUrl: string | null };
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [logoMediaId, setLogoMediaId] = useState(initial?.logoMediaId ?? null);
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(brandId ? `/api/admin/brands/${brandId}` : "/api/admin/brands", {
        method: brandId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, country, description, logoMediaId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/brands");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  function selectLogo(items: MediaItem[]) {
    const item = items[0];
    if (item) {
      setLogoMediaId(item.id);
      setLogoUrl(item.url);
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
        <span className="mb-1.5 block font-medium text-ink">Country</span>
        <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Description</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="text-sm">
        <span className="mb-1.5 block font-medium text-ink">Logo</span>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded file, not a static import
            <img src={logoUrl} alt="" className="h-12 w-12 rounded object-contain" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-sunken text-xs text-ink-faint">
              None
            </div>
          )}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="focus-ring cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            {logoUrl ? "Change" : "Choose"} Logo
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={() => {
                setLogoMediaId(null);
                setLogoUrl(null);
              }}
              className="focus-ring cursor-pointer text-sm text-ink-faint hover:text-destructive"
            >
              Remove
            </button>
          )}
        </div>
        <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={selectLogo} multiple={false} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : brandId ? "Save Changes" : "Create Brand"}
        </Button>
      </div>
    </form>
  );
}
