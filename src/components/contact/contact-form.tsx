"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const topics = [
  { value: "sales", label: "Sales inquiry" },
  { value: "quote", label: "Request a quote" },
  { value: "support", label: "Technical support" },
  { value: "partnership", label: "Business / partnership" },
];

export function ContactForm({
  defaultTopic,
  productSlug,
  productName,
}: {
  defaultTopic: string;
  productSlug?: string;
  productName?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState(topics.some((t) => t.value === defaultTopic) ? defaultTopic : "sales");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(productName ? `I'd like a quote for ${productName}.` : "");

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <CheckCircle size={40} weight="fill" className="mx-auto text-pk-green" />
        <h2 className="font-display mt-4 text-xl font-semibold text-ink">Message sent</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
      </div>
    );
  }

  const isQuote = topic === "quote";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          const res = await fetch(isQuote ? "/api/quote-requests" : "/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              isQuote
                ? { name, phone: phone || email, email, message, productSlug, productName }
                : { topic, name, email, message }
            ),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error ?? "Something went wrong. Please try again.");
            return;
          }
          setSubmitted(true);
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8"
    >
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">What can we help with?</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {productName && isQuote && (
        <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">Asking about: {productName}</p>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Email</span>
        <input
          type="email"
          required={!isQuote}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>
      {isQuote && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink">Phone</span>
          <input
            required
            type="tel"
            placeholder="03XX XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
          />
        </label>
      )}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Message</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
        />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
