"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

// Date input wants "YYYY-MM-DD"; expiresAt from the API is an ISO datetime.
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function CouponForm({
  couponId,
  initial,
}: {
  couponId?: string;
  initial?: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    maxDiscountAmount: number | null;
    minOrderAmount: number | null;
    maxRedemptions: number | null;
    active: boolean;
    expiresAt: string | null;
  };
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initial?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState(initial ? String(initial.discountValue) : "");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    initial?.maxDiscountAmount != null ? String(initial.maxDiscountAmount) : ""
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    initial?.minOrderAmount != null ? String(initial.minOrderAmount) : ""
  );
  const [maxRedemptions, setMaxRedemptions] = useState(
    initial?.maxRedemptions != null ? String(initial.maxRedemptions) : ""
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initial?.expiresAt ?? null));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons", {
        method: couponId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          maxDiscountAmount,
          minOrderAmount,
          maxRedemptions,
          active,
          expiresAt: expiresAt || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/coupons");
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
          Code <span className="text-destructive">*</span>
        </span>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. WELCOME10"
          className={`${inputClass} font-mono uppercase`}
        />
        <span className="mt-1 block text-xs text-ink-faint">
          What the customer types at checkout — not case-sensitive.
        </span>
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Discount type</span>
        <div className="flex gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name="discountType"
              checked={discountType === "percent"}
              onChange={() => setDiscountType("percent")}
            />
            Percentage off
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name="discountType"
              checked={discountType === "fixed"}
              onChange={() => setDiscountType("fixed")}
            />
            Fixed amount off
          </label>
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">
          {discountType === "percent" ? "Discount percentage" : "Discount amount (PKR)"}{" "}
          <span className="text-destructive">*</span>
        </span>
        <input
          required
          type="number"
          min={1}
          max={discountType === "percent" ? 100 : undefined}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          className={inputClass}
        />
      </label>

      {discountType === "percent" && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink">Max discount cap (PKR)</span>
          <input
            type="number"
            min={1}
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            placeholder="No cap"
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            Caps how much PKR a percentage discount can take off a big order. Leave blank for no cap.
          </span>
        </label>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Minimum order amount (PKR)</span>
        <input
          type="number"
          min={0}
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          placeholder="No minimum"
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Usage limit</span>
        <input
          type="number"
          min={1}
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
          placeholder="Unlimited"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">
          Total number of times this code can ever be used across all customers. Leave blank for unlimited.
        </span>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Expires on</span>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-faint">Leave blank for a code that never expires.</span>
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active (uncheck to disable without deleting)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : couponId ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
