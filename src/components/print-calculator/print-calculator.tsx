"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, UploadSimple } from "@phosphor-icons/react";
import type { PrintMaterial } from "@/lib/print-estimate";
import {
  detectModelFileKind,
  parseModelFileVolumeCm3,
  parseGcodeFilamentGrams,
  gramsFromVolume,
  gramsFromDimensions,
  estimatePrice,
} from "@/lib/print-estimate";
import { usePrintUploadStore } from "@/lib/print-upload-store";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";

type Mode = "model" | "gcode" | "manual";

const inputClass = "focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-ink";

const tabs: { mode: Mode; label: string; hint: string }[] = [
  { mode: "model", label: "Upload 3D file", hint: "STL or OBJ" },
  { mode: "gcode", label: "Upload G-code", hint: "Most accurate" },
  { mode: "manual", label: "Enter size by hand", hint: "No file needed" },
];

export function PrintCalculator({
  materials,
  supportOverheadPercent,
  serviceFeePkr,
}: {
  materials: PrintMaterial[];
  supportOverheadPercent: number;
  serviceFeePkr: number;
}) {
  const storeFile = usePrintUploadStore((s) => s.file);
  const setStoreFile = usePrintUploadStore((s) => s.setFile);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const gcodeInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("model");
  const [fileName, setFileName] = useState<string | null>(null);
  const [volumeCm3, setVolumeCm3] = useState<number | null>(null);
  const [gcodeText, setGcodeText] = useState<string | null>(null);
  const [widthMm, setWidthMm] = useState(100);
  const [depthMm, setDepthMm] = useState(100);
  const [heightMm, setHeightMm] = useState(100);
  const [materialIndex, setMaterialIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeFile) return;
    const kind = detectModelFileKind(storeFile.name);
    if (kind === "gcode") loadGcodeFile(storeFile);
    else loadModelFile(storeFile);
    setStoreFile(null);
    // Only ever run once, for the file (if any) handed off from the homepage widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadModelFile(file: File) {
    setLoading(true);
    setFileError(null);
    setFileName(file.name);
    try {
      const kind = detectModelFileKind(file.name);
      if (kind !== "stl" && kind !== "obj") {
        setFileError("Please upload an STL or OBJ file.");
        setFileName(null);
        return;
      }
      setMode("model");
      setVolumeCm3(await parseModelFileVolumeCm3(file));
    } catch {
      setFileError("Couldn't read that file — please try a different export of your model.");
      setFileName(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadGcodeFile(file: File) {
    setLoading(true);
    setFileError(null);
    setFileName(file.name);
    try {
      if (detectModelFileKind(file.name) !== "gcode") {
        setFileError("Please upload a .gcode file.");
        setFileName(null);
        return;
      }
      setMode("gcode");
      setGcodeText(await file.text());
    } catch {
      setFileError("Couldn't read that file.");
      setFileName(null);
    } finally {
      setLoading(false);
    }
  }

  const material = materials[materialIndex] ?? materials[0];

  const grams = useMemo(() => {
    if (!material) return null;
    if (mode === "model") return volumeCm3 !== null ? gramsFromVolume(volumeCm3, material) : null;
    if (mode === "gcode") return gcodeText !== null ? parseGcodeFilamentGrams(gcodeText, material) : null;
    return gramsFromDimensions(widthMm, depthMm, heightMm, material);
  }, [mode, volumeCm3, gcodeText, widthMm, depthMm, heightMm, material]);

  const breakdown = useMemo(() => {
    if (grams === null || !material) return null;
    return estimatePrice({ grams, quantity, material, supportOverheadPercent, serviceFeePkr });
  }, [grams, quantity, material, supportOverheadPercent, serviceFeePkr]);

  const accuracyNote =
    mode === "model"
      ? "Based on your file's exact size — the real weight can vary a little with infill and orientation."
      : mode === "gcode"
        ? "Read straight from your slicer's own calculation — the most accurate estimate we can give without printing it."
        : "A rough estimate based on the size you entered. Upload your file for a more accurate number.";

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-surface p-8 text-center">
        <CheckCircle size={40} weight="fill" className="mx-auto text-pk-green" />
        <h2 className="font-display mt-4 text-xl font-semibold text-ink">Request sent</h2>
        <p className="mt-2 text-sm text-ink-muted">
          We&apos;ve got your file and your estimate — our team will confirm the final price and reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.mode}
              type="button"
              onClick={() => setMode(t.mode)}
              className={`focus-ring cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                mode === t.mode
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-border-strong text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-normal text-ink-faint">({t.hint})</span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface p-6">
          {mode === "model" && (
            <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border-strong px-6 py-10 text-center">
              <UploadSimple size={26} className="text-blue-700" />
              <p className="mt-3 text-sm font-medium text-ink">{fileName ?? "Choose your STL or OBJ file"}</p>
              <input
                ref={modelInputRef}
                type="file"
                accept=".stl,.obj"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadModelFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => modelInputRef.current?.click()}
                className="focus-ring mt-3 cursor-pointer rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Choose a file
              </button>
            </div>
          )}

          {mode === "gcode" && (
            <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border-strong px-6 py-10 text-center">
              <UploadSimple size={26} className="text-blue-700" />
              <p className="mt-3 text-sm font-medium text-ink">{fileName ?? "Choose your .gcode file"}</p>
              <p className="mt-1 text-xs text-ink-faint">Exported from PrusaSlicer, Cura, SuperSlicer, or similar.</p>
              <input
                ref={gcodeInputRef}
                type="file"
                accept=".gcode,.gco,.g"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadGcodeFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => gcodeInputRef.current?.click()}
                className="focus-ring mt-3 cursor-pointer rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken"
              >
                Choose a file
              </button>
            </div>
          )}

          {mode === "manual" && (
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink">Width (mm)</span>
                <input
                  type="number"
                  min="1"
                  value={widthMm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink">Depth (mm)</span>
                <input
                  type="number"
                  min="1"
                  value={depthMm}
                  onChange={(e) => setDepthMm(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink">Height (mm)</span>
                <input
                  type="number"
                  min="1"
                  value={heightMm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {loading && <p className="mt-3 text-sm text-ink-muted">Reading your file…</p>}
          {fileError && <p className="mt-3 text-sm text-destructive">{fileError}</p>}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Material</span>
              <select
                value={materialIndex}
                onChange={(e) => setMaterialIndex(Number(e.target.value))}
                className={inputClass}
              >
                {materials.map((m, i) => (
                  <option key={m.name} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink">Quantity</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Your estimate</h3>
          {breakdown ? (
            <>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Estimated weight</dt>
                  <dd className="tabular font-medium text-ink">{breakdown.materialGrams} g</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Material cost</dt>
                  <dd className="tabular font-medium text-ink">{formatPKR(breakdown.materialCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Service fee</dt>
                  <dd className="tabular font-medium text-ink">{formatPKR(breakdown.serviceFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="tabular font-semibold text-ink">{formatPKR(breakdown.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink-faint">{accuracyNote}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">
              {mode === "manual"
                ? "Enter the size of your part to see a price."
                : "Upload a file to see your price here."}
            </p>
          )}

          {breakdown && (
            <form
              className="mt-6 space-y-3 border-t border-border pt-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setSubmitError(null);
                const sourceDescription =
                  mode === "manual" ? `${widthMm}×${depthMm}×${heightMm}mm, entered by hand` : fileName ?? "uploaded file";
                const summary = `Estimated 3D print: ${material.name} × ${quantity}, ~${breakdown.materialGrams}g — ${formatPKR(breakdown.total)}. Source: ${sourceDescription}.`;
                try {
                  const res = await fetch("/api/quote-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      phone,
                      email,
                      productName: `Custom 3D print — ${material.name}`,
                      message: message ? `${summary}\n\n${message}` : summary,
                    }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setSubmitError(data.error ?? "Something went wrong. Please try again.");
                    return;
                  }
                  setSubmitted(true);
                } catch {
                  setSubmitError("Couldn't reach the server. Check your connection and try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <h4 className="text-sm font-semibold text-ink">Request this print</h4>
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <label className="block text-sm">
                <span className="mb-1 block text-ink">Name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink">Phone</span>
                <input
                  required
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink">Email (optional)</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink">Anything else we should know? (optional)</span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink"
                />
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Request this print"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
