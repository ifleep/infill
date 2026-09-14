"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/admin/media-types";

interface MediaListResponse {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load(query, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate: only re-run on explicit search
  }, []);

  async function load(q: string, targetPage: number, append: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}&page=${targetPage}`);
      const data: MediaListResponse & { error?: string } = await res.json().catch(() => ({} as MediaListResponse));
      if (!res.ok) {
        setError(data.error ?? "Couldn't load the media library.");
        return;
      }
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setError("Network error while loading the media library.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setQuery(value);
    load(value, 1, false);
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    for (const file of Array.from(fileList)) formData.append("files", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      const uploaded: MediaItem[] = data.media ?? [];
      setItems((prev) => [...uploaded, ...prev]);
      setTotal((t) => t + uploaded.length);
    } catch {
      setError("Network error while uploading — please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleSave(item: MediaItem, patch: { alt?: string | null; caption?: string | null }) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i)));
    try {
      await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Best-effort — the field stays edited locally; a page refresh will reveal if it didn't save.
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Couldn't delete this file.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotal((t) => t - 1);
      if (selectedId === item.id) setSelectedId(null);
    } catch {
      alert("Network error while deleting.");
    }
  }

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const hasMore = items.length < total;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Media Library</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {total} file{total === 1 ? "" : "s"}. Reused across products, homepage sections and articles — nothing
            uploads twice.
          </p>
        </div>
        <label className="focus-ring cursor-pointer whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {uploading ? "Uploading…" : "Upload files"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by filename, alt text or caption…"
        className="focus-ring mb-4 w-full max-w-sm rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
      />

      {error && <p className="mb-4 rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`focus-ring group relative aspect-square overflow-hidden rounded-lg border bg-surface-sunken text-left transition-colors ${
              selectedId === item.id ? "border-blue-500 ring-2 ring-blue-500" : "border-border hover:border-border-strong"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
            <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {item.filename}
            </span>
          </button>
        ))}
      </div>

      {loading && items.length === 0 && <p className="py-10 text-center text-sm text-ink-faint">Loading…</p>}
      {!loading && items.length === 0 && <p className="py-10 text-center text-sm text-ink-faint">No media found.</p>}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => load(query, page + 1, true)}
            disabled={loading}
            className="focus-ring cursor-pointer rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setSelectedId(null)}>
          <div
            className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 aspect-video overflow-hidden rounded-md bg-surface-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
              <img src={selected.url} alt={selected.alt ?? ""} className="h-full w-full object-contain" />
            </div>
            <p className="mb-3 text-xs text-ink-faint">
              {selected.filename} {selected.size != null ? `· ${formatBytes(selected.size)}` : ""}
              {selected.width && selected.height ? ` · ${selected.width}×${selected.height}` : ""}
            </p>
            <label className="mb-3 block text-sm">
              <span className="mb-1 block font-medium text-ink">Alt text</span>
              <input
                defaultValue={selected.alt ?? ""}
                onBlur={(e) => handleSave(selected, { alt: e.target.value || null })}
                className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
                placeholder="Describes the image for accessibility and SEO"
              />
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block font-medium text-ink">Caption</span>
              <input
                defaultValue={selected.caption ?? ""}
                onBlur={(e) => handleSave(selected, { caption: e.target.value || null })}
                className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
              />
            </label>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selected)}
                className="focus-ring cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive-tint"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="focus-ring cursor-pointer rounded-md bg-surface-sunken px-4 py-2 text-sm font-medium text-ink hover:bg-border"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
