"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { ShippingRate, SiteSettings } from "@/lib/data/settings";

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
        <h2 className="font-display text-base font-semibold text-ink">Shipping</h2>
        <p className="mt-1 text-sm text-ink-muted">Flat rate + delivery estimate shown at checkout, per city.</p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Default shipping cost</span>
        <input
          type="number"
          min={0}
          value={values.defaultShippingCost}
          onChange={(e) => setValues((v) => ({ ...v, defaultShippingCost: Number(e.target.value) || 0 }))}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">Used for any city not listed below.</span>
      </label>

      <div className="space-y-2.5">
        {values.shippingRates.map((rate, i) => (
          <ShippingRateRow
            key={i}
            rate={rate}
            onChange={(next) =>
              setValues((v) => ({
                ...v,
                shippingRates: v.shippingRates.map((r, idx) => (idx === i ? next : r)),
              }))
            }
            onRemove={() =>
              setValues((v) => ({ ...v, shippingRates: v.shippingRates.filter((_, idx) => idx !== i) }))
            }
          />
        ))}
        <button
          type="button"
          onClick={() =>
            setValues((v) => ({ ...v, shippingRates: [...v.shippingRates, { city: "", cost: 0, etaDays: 3 }] }))
          }
          className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border-strong px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
        >
          <Plus size={14} /> Add city
        </button>
      </div>

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

function ShippingRateRow({
  rate,
  onChange,
  onRemove,
}: {
  rate: ShippingRate;
  onChange: (rate: ShippingRate) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={rate.city}
        onChange={(e) => onChange({ ...rate, city: e.target.value })}
        placeholder="City"
        className={`${inputClass} w-32`}
      />
      <input
        type="number"
        min={0}
        value={rate.cost}
        onChange={(e) => onChange({ ...rate, cost: Number(e.target.value) || 0 })}
        placeholder="Cost"
        className={`${inputClass} w-24`}
      />
      <input
        type="number"
        min={1}
        value={rate.etaDays ?? ""}
        onChange={(e) => onChange({ ...rate, etaDays: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="Days"
        className={`${inputClass} w-20`}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${rate.city || "row"}`}
        className="focus-ring cursor-pointer rounded-md p-2 text-ink-faint hover:text-destructive"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
