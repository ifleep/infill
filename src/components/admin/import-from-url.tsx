"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/admin/media-types";

/**
 * Paste a link — a direct image, or a manufacturer product page — and pick
 * which image(s) found there to actually bring into the Media Library.
 * Two-step: scan (find candidates, nothing saved yet) then import (only
 * the checked ones get downloaded and saved). See
 * /api/admin/media/scan-url and /api/admin/media/import-url.
 */
export function ImportFromUrl({ onImported }: { onImported: (items: MediaItem[]) => void }) {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [failedImports, setFailedImports] = useState<{ url: string; error: string }[]>([]);

  async function handleScan() {
    if (!url.trim()) return;
    setScanning(true);
    setError(null);
    setCandidates(null);
    setFailedImports([]);
    try {
      const res = await fetch("/api/admin/media/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't scan that URL.");
        return;
      }
      const found: string[] = data.candidates ?? [];
      setCandidates(found);
      // A single direct-image result is almost certainly what the admin
      // wanted — pre-check it so one click imports it. A page with many
      // candidates starts unchecked so nothing gets pulled in by accident.
      setSelected(found.length === 1 ? { [found[0]]: true } : {});
    } catch {
      setError("Network error while scanning that URL.");
    } finally {
      setScanning(false);
    }
  }

  function toggle(candidateUrl: string) {
    setSelected((prev) => ({ ...prev, [candidateUrl]: !prev[candidateUrl] }));
  }

  async function handleImport() {
    const toImport = Object.keys(selected).filter((u) => selected[u]);
    if (toImport.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: toImport }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      const imported: MediaItem[] = data.media ?? [];
      const failed: { url: string; error: string }[] = data.errors ?? [];
      if (imported.length > 0) onImported(imported);
      setFailedImports(failed);
      // Every attempted URL ends up in exactly one of media/errors — drop
      // the successes from the grid, keep failures visible with why.
      const failedUrls = new Set(failed.map((f) => f.url));
      setCandidates((prev) => (prev ?? []).filter((u) => !toImport.includes(u) || failedUrls.has(u)));
      setSelected({});
    } catch {
      setError("Network error while importing.");
    } finally {
      setImporting(false);
    }
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="https://manufacturer.com/product-page or a direct image link"
          className="focus-ring w-full rounded-md border border-border-strong px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning || !url.trim()}
          className="focus-ring cursor-pointer whitespace-nowrap rounded-md bg-surface-sunken px-3 py-1.5 text-sm font-medium text-ink hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scanning ? "Scanning…" : "Find images"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">
        Paste a manufacturer&rsquo;s product page to find every image on it, or a direct image link to import just
        that one.
      </p>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {candidates && candidates.length > 0 && (
        <div className="mt-3">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {candidates.map((candidateUrl) => {
              const isSelected = Boolean(selected[candidateUrl]);
              const failure = failedImports.find((f) => f.url === candidateUrl);
              return (
                <button
                  key={candidateUrl}
                  type="button"
                  onClick={() => toggle(candidateUrl)}
                  title={candidateUrl}
                  className={`focus-ring group relative aspect-square overflow-hidden rounded-md border bg-surface-sunken transition-colors ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-border hover:border-border-strong"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- previewing an external URL, not a static import */}
                  <img src={candidateUrl} alt="" className="h-full w-full object-cover" />
                  {isSelected && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      ✓
                    </span>
                  )}
                  {failure && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-destructive/90 px-1 py-0.5 text-[9px] text-white">
                      {failure.error}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className="focus-ring cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing…" : `Import ${selectedCount || ""} selected`}
            </button>
            <span className="text-xs text-ink-faint">
              {candidates.length} image{candidates.length === 1 ? "" : "s"} found
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
