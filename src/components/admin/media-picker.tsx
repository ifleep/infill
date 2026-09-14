"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/admin/media-types";

/**
 * Modal for choosing existing Media Library items (with search + upload
 * new-files-in-place) — shared by the product photo manager and, later,
 * the block content editor and homepage CMS so nothing has to re-upload
 * the same image twice (see AGENTS spec requirement #7).
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = true,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<Record<string, MediaItem>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    load(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on open, not on every keystroke
  }, [open]);

  async function load(q: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't load the media library.");
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Network error while loading the media library.");
    } finally {
      setLoading(false);
    }
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
      setSelected((prev) => {
        const next = { ...prev };
        for (const m of uploaded) next[m.id] = m;
        return next;
      });
    } catch {
      setError("Network error while uploading — please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function toggle(item: MediaItem) {
    setSelected((prev) => {
      if (!multiple) return prev[item.id] ? {} : { [item.id]: item };
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  function confirm() {
    onSelect(Object.values(selected));
    onClose();
  }

  if (!open) return null;

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Media Library</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring cursor-pointer rounded p-1 text-ink-muted hover:bg-surface-sunken"
          >
            &times;
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(e.target.value);
            }}
            placeholder="Search by filename, alt text or caption…"
            className="focus-ring w-full rounded-md border border-border-strong px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint"
          />
          <label className="focus-ring cursor-pointer whitespace-nowrap rounded-md bg-surface-sunken px-3 py-1.5 text-sm font-medium text-ink hover:bg-border">
            {uploading ? "Uploading…" : "Upload new"}
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

        {error && <p className="px-5 pt-3 text-sm text-destructive">{error}</p>}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-faint">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">No media found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {items.map((item) => {
                const isSelected = Boolean(selected[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    className={`focus-ring group relative aspect-square overflow-hidden rounded-md border bg-surface-sunken transition-colors ${
                      isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-border hover:border-border-strong"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
                    <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-sm text-ink-faint">{selectedCount} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={selectedCount === 0}
              className="focus-ring cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use {selectedCount || ""} {selectedCount === 1 ? "photo" : "photos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
