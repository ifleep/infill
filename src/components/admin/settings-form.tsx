"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/data/settings";

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
