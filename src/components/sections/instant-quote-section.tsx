"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple, FileArrowUp, ArrowRight } from "@phosphor-icons/react";
import type { PrintMaterial } from "@/lib/print-estimate";
import { detectModelFileKind, parseModelFileVolumeCm3, gramsFromVolume, parseGcodeFilamentGrams, estimatePrice } from "@/lib/print-estimate";
import { usePrintUploadStore } from "@/lib/print-upload-store";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatPKR } from "@/lib/format";

interface MaterialQuote {
  material: PrintMaterial;
  grams: number | null;
}

/**
 * The homepage's "upload and see a price right away" widget — most people
 * land on the homepage, not the services page, so this is the first place
 * they should be able to tell INFiLLPK actually prints custom parts, not
 * just sells printers. Deliberately does the bare minimum: one file, one
 * quantity, every material's price at once. Anyone who wants more control
 * (G-code, manual size entry, quantity, support settings, requesting the
 * print) is sent to the full calculator with the same file already loaded.
 */
export function InstantQuoteSection({
  materials,
  supportOverheadPercent,
  serviceFeePkr,
}: {
  materials: PrintMaterial[];
  supportOverheadPercent: number;
  serviceFeePkr: number;
}) {
  const router = useRouter();
  const setUploadedFile = usePrintUploadStore((s) => s.setFile);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<MaterialQuote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setQuotes(null);
    setFileName(file.name);
    setPendingFile(file);
    try {
      const kind = detectModelFileKind(file.name);
      if (kind === "stl" || kind === "obj") {
        const volumeCm3 = await parseModelFileVolumeCm3(file);
        setQuotes(materials.map((material) => ({ material, grams: gramsFromVolume(volumeCm3, material) })));
      } else if (kind === "gcode") {
        const text = await file.text();
        setQuotes(materials.map((material) => ({ material, grams: parseGcodeFilamentGrams(text, material) })));
      } else {
        setError("Please upload an STL, OBJ, or G-code file.");
        setFileName(null);
        setPendingFile(null);
      }
    } catch {
      setError("Couldn't read that file — please try a different export of your model.");
      setFileName(null);
      setPendingFile(null);
    } finally {
      setLoading(false);
    }
  }

  function goToFullCalculator() {
    setUploadedFile(pendingFile);
    router.push("/print-price-calculator");
  }

  return (
    <section className="bg-navy-900 py-20 text-on-navy sm:py-28">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              inverted
              eyebrow="3D Printing Service"
              title="Yes — we 3D print your design. Upload it and see the price now."
              description="No one else in Pakistan gives you a live price like this. Upload your STL, OBJ, or G-code file and we'll show you the cost in every material, instantly — free, no account, no waiting for a reply."
            />
            <ul className="mt-6 space-y-2 text-sm text-on-navy-muted">
              <li className="flex items-center gap-2">
                <span className="text-blue-300">—</span> Have a slicer file already? Upload the G-code for the most accurate price.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-300">—</span> Only have the 3D model? Upload the STL or OBJ instead.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-300">—</span> No file at all? The full calculator lets you enter the size by hand.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver ? "border-blue-300 bg-white/10" : "border-white/25"
              }`}
            >
              <UploadSimple size={28} className="text-blue-300" />
              <p className="mt-3 text-sm font-medium text-on-navy">
                {fileName ? fileName : "Drag your file here, or"}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".stl,.obj,.gcode,.gco,.g"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="focus-ring mt-3 cursor-pointer rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-on-navy hover:bg-white/20"
              >
                Choose a file
              </button>
              <p className="mt-3 text-xs text-on-navy-muted">STL, OBJ, or G-code — up to 50MB.</p>
            </div>

            {loading && <p className="mt-4 text-sm text-on-navy-muted">Working out your price…</p>}
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

            {quotes && (
              <div className="mt-6">
                <div className="overflow-hidden rounded-lg border border-white/15">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/15 bg-white/5 text-left text-xs uppercase tracking-wide text-on-navy-muted">
                        <th className="px-3 py-2 font-medium">Material</th>
                        <th className="px-3 py-2 font-medium">Weight</th>
                        <th className="px-3 py-2 text-right font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map(({ material, grams }) => {
                        const breakdown =
                          grams !== null
                            ? estimatePrice({ grams, quantity: 1, material, supportOverheadPercent, serviceFeePkr })
                            : null;
                        return (
                          <tr key={material.name} className="border-b border-white/10 last:border-0">
                            <td className="px-3 py-2 font-medium text-on-navy">{material.name}</td>
                            <td className="px-3 py-2 text-on-navy-muted">
                              {breakdown ? `${breakdown.materialGrams} g` : "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-on-navy tabular">
                              {breakdown ? formatPKR(breakdown.total) : "couldn't read weight"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-on-navy-muted">
                  An estimate based on your file — the final price is confirmed when we review your order.
                </p>
                <button
                  type="button"
                  onClick={goToFullCalculator}
                  className="focus-ring mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <FileArrowUp size={18} />
                  See full details & request this print
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {!quotes && !loading && (
              <button
                type="button"
                onClick={() => router.push("/print-price-calculator")}
                className="focus-ring mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                Don&apos;t have a file? Enter the size by hand instead <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
