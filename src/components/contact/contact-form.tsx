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

export function ContactForm({ defaultTopic }: { defaultTopic: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState(topics.some((t) => t.value === defaultTopic) ? defaultTopic : "sales");

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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8"
    >
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
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Name</span>
        <input
          required
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Email</span>
        <input
          type="email"
          required
          className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink">Message</span>
        <textarea
          required
          rows={5}
          className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
        />
      </label>
      <Button type="submit" size="lg" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
