"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Page } from "@/lib/data/pages";
import type { ContentBlock } from "@/lib/content-blocks/types";
import { Button } from "@/components/ui/button";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";

interface FormValues {
  title: string;
  slug: string;
  status: "draft" | "published";
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  noindex: boolean;
}

function fromPage(p: Page): FormValues {
  return {
    title: p.title,
    slug: p.slug,
    status: p.status,
    seoTitle: p.seoTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    canonicalUrl: p.canonicalUrl ?? "",
    ogTitle: p.ogTitle ?? "",
    ogDescription: p.ogDescription ?? "",
    noindex: p.noindex,
  };
}

const empty: FormValues = {
  title: "",
  slug: "",
  status: "published",
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  noindex: false,
};

export function PageForm({ page, pageId }: { page?: Page; pageId?: string }) {
  const [values, setValues] = useState<FormValues>(page ? fromPage(page) : empty);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(page?.contentBlocks ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { ...values, contentBlocks };
    try {
      const res = await fetch(pageId ? `/api/admin/pages/${pageId}` : "/api/admin/pages", {
        method: pageId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-5 rounded-xl border border-border bg-surface p-6">
      {error && <p className="rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" required>
          <input required value={values.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>
        <Field label="URL slug" hint="Leave blank to auto-generate from title">
          <input
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Status" required>
        <select value={values.status} onChange={(e) => set("status", e.target.value as "draft" | "published")} className={inputClass}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Content</span>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </div>

      <div className="border-t border-border pt-5">
        <span className="mb-1.5 block text-sm font-medium text-ink">SEO</span>
        <div className="space-y-3">
          <Field label="SEO title">
            <input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={values.title} className={inputClass} />
          </Field>
          <Field label="Meta description">
            <textarea rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className={inputClass} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={values.noindex} onChange={(e) => set("noindex", e.target.checked)} />
            Hide from search engines (noindex)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : pageId ? "Save Changes" : "Create Page"}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}
