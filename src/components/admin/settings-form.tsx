"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { SiteSettings } from "@/lib/data/settings";
import type { PrintMaterial } from "@/lib/print-estimate";
import { HeroImagesEditor } from "@/components/admin/hero-images-editor";

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setError("Couldn't save settings — please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateMaterial(index: number, patch: Partial<PrintMaterial>) {
    setValues((v) => {
      const materials = [...v.printMaterials];
      materials[index] = { ...materials[index], ...patch };
      return { ...v, printMaterials: materials };
    });
  }

  function addMaterial() {
    setValues((v) => ({
      ...v,
      printMaterials: [...v.printMaterials, { name: "", densityGCm3: 1.24, pricePerKgPkr: 0 }],
    }));
  }

  function removeMaterial(index: number) {
    setValues((v) => ({ ...v, printMaterials: v.printMaterials.filter((_, i) => i !== index) }));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5 rounded-xl border border-border bg-surface p-6">
      {error && <p className="rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>}

      <div>
        <h2 className="font-display text-base font-semibold text-ink">WhatsApp contact button</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Controls the floating WhatsApp button shown on every public page.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">WhatsApp number</span>
        <input
          value={values.whatsappNumber}
          onChange={(e) => setValues((v) => ({ ...v, whatsappNumber: e.target.value }))}
          placeholder="923001234567"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">
          Country code + number, digits only (e.g. 923001234567 for a Pakistani number).
        </span>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Pre-filled message</span>
        <input
          value={values.whatsappMessage}
          onChange={(e) => setValues((v) => ({ ...v, whatsappMessage: e.target.value }))}
          className={inputClass}
        />
      </label>

      <div className="border-t border-border pt-5">
        <h2 className="font-display text-base font-semibold text-ink">Order notifications</h2>
        <p className="mt-1 text-sm text-ink-muted">Where new-order emails are sent (in addition to the customer).</p>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Store notification email</span>
        <input
          type="email"
          value={values.storeNotificationEmail}
          onChange={(e) => setValues((v) => ({ ...v, storeNotificationEmail: e.target.value }))}
          placeholder="orders@infillpk.com"
          className={inputClass}
        />
      </label>

      <div className="border-t border-border pt-5">
        <h2 className="font-display text-base font-semibold text-ink">Homepage hero photos</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The photo carousel at the top of the homepage (desktop and tablet). Use the arrows to reorder.
        </p>
      </div>
      <HeroImagesEditor
        images={values.heroImages}
        onChange={(heroImages) => setValues((v) => ({ ...v, heroImages }))}
      />

      <div className="border-t border-border pt-5">
        <h2 className="font-display text-base font-semibold text-ink">Homepage hero photos (mobile)</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Shown only on phones, in place of the photos above — upload versions cropped/composed for a narrow,
          tall screen instead of a wide one. Leave empty to reuse the desktop photos on phones too.
        </p>
      </div>
      <HeroImagesEditor
        images={values.heroImagesMobile}
        onChange={(heroImagesMobile) => setValues((v) => ({ ...v, heroImagesMobile }))}
      />

      <div className="border-t border-border pt-5">
        <h2 className="font-display text-base font-semibold text-ink">Review video</h2>
        <p className="mt-1 text-sm text-ink-muted">
          A small video card on the homepage. Leave the URL blank to hide it entirely.
        </p>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Video URL</span>
        <input
          value={values.reviewVideoUrl}
          onChange={(e) => setValues((v) => ({ ...v, reviewVideoUrl: e.target.value }))}
          placeholder="https://.../reviews.mp4"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">A direct link to an .mp4 file.</span>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Caption</span>
        <input
          value={values.reviewVideoCaption}
          onChange={(e) => setValues((v) => ({ ...v, reviewVideoCaption: e.target.value }))}
          placeholder="What our customers are saying"
          className={inputClass}
        />
      </label>

      <div className="border-t border-border pt-5">
        <h2 className="font-display text-base font-semibold text-ink">Print price calculator</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Materials and pricing used to estimate 3D-printing quotes. Prices are per kilogram — set these to your
          real costs before customers rely on the quotes.
        </p>
      </div>

      <div className="space-y-2">
        {values.printMaterials.map((material, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
            <input
              value={material.name}
              onChange={(e) => updateMaterial(i, { name: e.target.value })}
              placeholder="Name (e.g. PLA)"
              className={`${inputClass} w-28`}
            />
            <label className="flex items-center gap-1 text-xs text-ink-muted">
              Density
              <input
                type="number"
                step="0.01"
                min="0"
                value={material.densityGCm3}
                onChange={(e) => updateMaterial(i, { densityGCm3: Number(e.target.value) })}
                placeholder="g/cm³"
                className={`${inputClass} w-20`}
              />
              g/cm³
            </label>
            <label className="flex flex-1 items-center gap-1 text-xs text-ink-muted">
              Price
              <input
                type="number"
                step="1"
                min="0"
                value={material.pricePerKgPkr}
                onChange={(e) => updateMaterial(i, { pricePerKgPkr: Number(e.target.value) })}
                placeholder="PKR/kg"
                className={`${inputClass} w-24`}
              />
              PKR/kg
            </label>
            <button
              type="button"
              onClick={() => removeMaterial(i)}
              aria-label="Remove material"
              className="focus-ring cursor-pointer rounded p-1 text-ink-faint hover:text-destructive"
            >
              <Trash size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMaterial}
          className="focus-ring flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-border-strong px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
        >
          <Plus size={14} />
          Add material
        </button>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Support material overhead (%)</span>
        <input
          type="number"
          min="0"
          value={values.printSupportOverheadPercent}
          onChange={(e) => setValues((v) => ({ ...v, printSupportOverheadPercent: Number(e.target.value) }))}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">
          Extra material assumed for supports, added on top of the estimated part weight.
        </span>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Service fee (PKR)</span>
        <input
          type="number"
          min="0"
          value={values.printServiceFeePkr}
          onChange={(e) => setValues((v) => ({ ...v, printServiceFeePkr: Number(e.target.value) }))}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">Flat handling fee added to every quote.</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="focus-ring cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs font-medium text-pk-green">Saved</span>}
      </div>
    </form>
  );
}
