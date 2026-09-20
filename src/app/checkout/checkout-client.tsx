"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useCartStore, useCartTotal } from "@/components/cart/cart-store";
import { formatPKR } from "@/lib/format";
import { Button, LinkButton } from "@/components/ui/button";

const steps = ["Contact", "Delivery", "Payment", "Review", "Confirmation"];

// Mirrors the server-side calc in src/lib/data/orders.ts — this is only an
// estimate shown before placing the order; the server always recomputes the
// real charge from the database, so a stale/tampered client value can't
// change what's actually billed.
const SHIPPING_COST_PER_KG = 250;
const SHIPPING_COST_CAP = 2500;
const FALLBACK_ITEM_WEIGHT_KG = 1;

const WHATSAPP_NUMBER = "923185262969";

interface FormState {
  email: string;
  phone: string;
  fullName: string;
  address: string;
  city: string;
  province: string;
  paymentMethod: "cod" | "transfer";
}

export default function CheckoutClient({
  initial = {},
}: {
  initial?: Partial<Omit<FormState, "paymentMethod">>;
}) {
  const hydrate = useCartStore((s) => s.hydrate);
  const lines = useCartStore((s) => s.lines);
  const clear = () => useCartStore.setState({ lines: [] });
  const subtotal = useCartTotal();

  const [step, setStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    fullName: initial.fullName ?? "",
    address: initial.address ?? "",
    city: initial.city ?? "",
    province: initial.province ?? "Punjab",
    paymentMethod: "cod",
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const shipping = useMemo(() => {
    if (lines.length === 0) return 0;
    const totalWeightKg = lines.reduce((sum, l) => sum + (l.weightKg ?? FALLBACK_ITEM_WEIGHT_KG) * l.quantity, 0);
    return Math.min(Math.round(totalWeightKg * SHIPPING_COST_PER_KG), SHIPPING_COST_CAP);
  }, [lines]);
  const total = subtotal + shipping;

  if (lines.length === 0 && step < 4) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-muted">Your cart is empty.</p>
        <LinkButton href="/category/3d-printers" className="mt-4">
          Shop 3D Printers
        </LinkButton>
      </div>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          province: form.province,
          paymentMethod: form.paymentMethod,
          lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Something went wrong placing your order.");
        return;
      }
      setOrderNumber(data.orderNumber);
      setStep(4);
      clear();
    } catch {
      setOrderError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Checkout</h1>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {steps.map((s, i) => (
          <span key={s} className={i <= step ? "font-semibold text-blue-700" : "text-ink-faint"}>
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border p-6 sm:p-8">
          {step === 0 && (
            <StepContact
              form={form}
              setForm={setForm}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepDelivery form={form} setForm={setForm} onBack={() => setStep(0)} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepPayment form={form} setForm={setForm} onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <StepReview
              form={form}
              onBack={() => setStep(2)}
              onPlaceOrder={placeOrder}
              placing={placing}
              error={orderError}
            />
          )}
          {step === 4 && orderNumber && (
            <StepConfirmation orderNumber={orderNumber} email={form.email} paymentMethod={form.paymentMethod} />
          )}
        </div>

        {step < 4 && (
          <div className="h-fit rounded-xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
            <ul className="mt-4 space-y-2">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.variantId ?? ""}`} className="flex justify-between text-sm text-ink-muted">
                  <span>
                    {l.name}
                    {l.variantLabel ? ` (${l.variantLabel})` : ""} × {l.quantity}
                  </span>
                  <span className="tabular">{formatPKR(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Product total</span>
                <span className="tabular">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className="tabular">{formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span className="tabular">{formatPKR(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      <input
        {...props}
        className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink placeholder:text-ink-faint"
      />
    </label>
  );
}

function StepContact({
  form,
  setForm,
  onNext,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onNext: () => void;
}) {
  const valid = form.email.includes("@") && form.phone.length >= 7;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink">Contact</h2>
      <Field
        label="Email"
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Field
        label="Phone"
        type="tel"
        required
        placeholder="03XX XXXXXXX"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
      />
      <Button size="lg" onClick={onNext} disabled={!valid}>
        Continue to Delivery
      </Button>
    </div>
  );
}

const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Jammu & Kashmir"];

function StepDelivery({
  form,
  setForm,
  onBack,
  onNext,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = form.fullName && form.address && form.city;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink">Delivery</h2>
      <Field
        label="Full name"
        required
        value={form.fullName}
        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
      />
      <Field
        label="Address"
        required
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Field
            label="City"
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink">Province</span>
          <select
            value={form.province}
            onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
          >
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!valid}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}

function StepPayment({
  form,
  setForm,
  onBack,
  onNext,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink">Payment</h2>
      <div className="space-y-2.5">
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border-strong p-4 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "cod"}
            onChange={() => setForm((f) => ({ ...f, paymentMethod: "cod" }))}
          />
          <span>
            <span className="block text-sm font-medium text-ink">Cash on Delivery</span>
            <span className="block text-xs text-ink-muted">Pay when your order arrives.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border-strong p-4 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "transfer"}
            onChange={() => setForm((f) => ({ ...f, paymentMethod: "transfer" }))}
          />
          <span>
            <span className="block text-sm font-medium text-ink">Bank / Mobile Wallet Transfer</span>
            <span className="block text-xs text-ink-muted">HBL, Sadapay, or Easypaisa — details on the next step.</span>
          </span>
        </label>
      </div>
      {form.paymentMethod === "transfer" && <TransferInstructions />}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review Order</Button>
      </div>
    </div>
  );
}

function TransferInstructions() {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface-sunken p-4 text-sm">
      <p className="font-medium text-ink">Send payment to any one of these, then continue:</p>
      <ul className="space-y-1.5 text-ink-muted">
        <li>
          <span className="font-medium text-ink">HBL Bank</span> — 05347902580503 (Shoaib Awan)
        </li>
        <li>
          <span className="font-medium text-ink">Sadapay</span> — 03185262969
        </li>
        <li>
          <span className="font-medium text-ink">Easypaisa</span> — 03185262969
        </li>
      </ul>
      <p className="text-ink-muted">
        After paying, send a screenshot of the payment to our{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring font-medium text-blue-700 hover:text-blue-600"
        >
          WhatsApp
        </a>{" "}
        along with your order number so we can confirm it and start processing your order.
      </p>
    </div>
  );
}

function StepReview({
  form,
  onBack,
  onPlaceOrder,
  placing,
  error,
}: {
  form: FormState;
  onBack: () => void;
  onPlaceOrder: () => void;
  placing: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-ink">Review</h2>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">Contact</p>
          <p className="text-ink">{form.email} · {form.phone}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">Delivery</p>
          <p className="text-ink">
            {form.fullName}, {form.address}, {form.city}, {form.province}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">Payment</p>
          <p className="text-ink">
            {form.paymentMethod === "cod" ? "Cash on Delivery" : "Bank / Mobile Wallet Transfer"}
          </p>
        </div>
      </div>
      {form.paymentMethod === "transfer" && <TransferInstructions />}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} disabled={placing}>
          Back
        </Button>
        <Button onClick={onPlaceOrder} disabled={placing}>
          {placing ? "Placing order…" : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

function StepConfirmation({
  orderNumber,
  email,
  paymentMethod,
}: {
  orderNumber: string;
  email: string;
  paymentMethod: FormState["paymentMethod"];
}) {
  return (
    <div className="py-8 text-center">
      <CheckCircle size={48} weight="fill" className="mx-auto text-pk-green" />
      <h2 className="font-display mt-4 text-2xl font-semibold text-ink">Order confirmed</h2>
      <p className="mt-2 text-ink-muted">
        Order <span className="tabular font-medium text-ink">{orderNumber}</span> has been placed.
        {email && <> A confirmation will be sent to {email}.</>}
      </p>
      {paymentMethod === "transfer" && (
        <div className="mx-auto mt-6 max-w-sm text-left">
          <TransferInstructions />
          <p className="mt-2 text-xs text-ink-faint">
            Mention order <span className="tabular font-medium text-ink">{orderNumber}</span> when you send the
            screenshot.
          </p>
        </div>
      )}
      <LinkButton href="/" className="mt-6">
        Back to Home
      </LinkButton>
    </div>
  );
}
