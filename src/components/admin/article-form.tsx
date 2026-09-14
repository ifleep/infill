"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/types";
import type { ContentBlock } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { Button } from "@/components/ui/button";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";
import { MediaPicker } from "@/components/admin/media-picker";

const categories: Article["category"][] = ["Buying Guide", "Comparison", "Materials", "Maintenance", "Technology"];

interface FormValues {
  title: string;
  slug: string;
  excerpt: string;
  category: Article["category"];
  readingMinutes: number | "";
  author: string;
  status: Article["status"];
  publishedAt: string;
  seoTitle: string;
  metaDescription: string;
  noindex: boolean;
}

function fromArticle(a: Article): FormValues {
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    category: a.category,
    readingMinutes: a.readingMinutes,
    author: a.author ?? "",
    status: a.status,
    publishedAt: a.publishedAt,
    seoTitle: a.seoTitle ?? "",
    metaDescription: a.metaDescription ?? "",
    noindex: a.noindex ?? false,
  };
}

const empty: FormValues = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Buying Guide",
  readingMinutes: 5,
  author: "",
  status: "published",
  publishedAt: "",
  seoTitle: "",
  metaDescription: "",
  noindex: false,
};

export function ArticleForm({ article, articleId }: { article?: Article; articleId?: string }) {
  const [values, setValues] = useState<FormValues>(article ? fromArticle(article) : empty);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(article?.contentBlocks ?? []);
  const [featuredImage, setFeaturedImage] = useState<MediaItem | null>(
    article?.featuredImageUrl ? { id: "", url: article.featuredImageUrl, alt: null, caption: null } : null
  );
  const [pickerOpen, setPickerOpen] = useState(false);
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
    const body = {
      ...values,
      readingMinutes: values.readingMinutes === "" ? 4 : values.readingMinutes,
      publishedAt: values.publishedAt || null,
      contentBlocks,
      featuredImageId: featuredImage?.id || null,
    };
    try {
      const res = await fetch(articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles", {
        method: articleId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/lab");
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

      <Field label="Excerpt" required hint="Shown on the INFiLL Lab index and as the meta description fallback">
        <textarea required rows={2} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputClass} />
      </Field>

      <div className="grid grid-cols-4 gap-4">
        <Field label="Category" required>
          <select value={values.category} onChange={(e) => set("category", e.target.value as Article["category"])} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reading time (min)">
          <input
            type="number"
            min={1}
            value={values.readingMinutes}
            onChange={(e) => set("readingMinutes", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Author">
          <input value={values.author} onChange={(e) => set("author", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Status" required>
          <select value={values.status} onChange={(e) => set("status", e.target.value as Article["status"])} className={inputClass}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </Field>
      </div>

      {values.status === "scheduled" && (
        <Field label="Publish date" hint="The article stays a draft on the public site until this date">
          <input type="date" value={values.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputClass} />
        </Field>
      )}

      <Field label="Featured image">
        {featuredImage?.url ? (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
            <img src={featuredImage.url} alt="" className="h-16 w-28 rounded object-cover" />
          </div>
        ) : (
          <p className="mb-2 text-xs text-ink-faint">No image selected.</p>
        )}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="focus-ring cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken"
        >
          {featuredImage ? "Change image" : "Choose image"}
        </button>
        <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} multiple={false} onSelect={(items) => items[0] && setFeaturedImage(items[0])} />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Article content</span>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </div>

      <div className="border-t border-border pt-5">
        <span className="mb-1.5 block text-sm font-medium text-ink">SEO</span>
        <div className="space-y-3">
          <Field label="SEO title">
            <input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={values.title} className={inputClass} />
          </Field>
          <Field label="Meta description">
            <textarea rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} placeholder={values.excerpt} className={inputClass} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={values.noindex} onChange={(e) => set("noindex", e.target.checked)} />
            Hide from search engines (noindex)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : articleId ? "Save Changes" : "Create Article"}
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
