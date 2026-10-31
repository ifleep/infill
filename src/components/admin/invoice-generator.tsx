"use client";

import { useState } from "react";
import Link from "next/link";
import { FilePdf, FileDoc } from "@phosphor-icons/react";
import type { BankAccount } from "@/lib/data/settings";

export function InvoiceGenerator({
  orderId,
  bankAccounts,
}: {
  orderId: string;
  bankAccounts: BankAccount[];
}) {
  const [bankAccountId, setBankAccountId] = useState<string>(bankAccounts[0]?.id ?? "");
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  async function download(format: "pdf" | "docx") {
    setDownloading(format);
    try {
      const params = new URLSearchParams({ format });
      if (bankAccountId) params.set("bankAccountId", bankAccountId);
      const res = await fetch(`/api/admin/orders/${orderId}/invoice?${params.toString()}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `invoice.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Couldn't generate the invoice — please try again.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display mb-4 text-sm font-semibold text-ink">Invoice</h2>

      <label className="block text-xs font-medium text-ink-muted">Bank account on invoice</label>
      {bankAccounts.length > 0 ? (
        <select
          value={bankAccountId}
          onChange={(e) => setBankAccountId(e.target.value)}
          className="select-arrow focus-ring mt-1 w-full rounded-md border border-border-strong py-2 pl-3 text-sm"
        >
          {bankAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-1 text-xs text-ink-faint">
          No saved bank accounts yet — add one in{" "}
          <Link href="/admin/settings" className="text-blue-700 hover:underline">
            Settings
          </Link>{" "}
          to include payment details on the invoice.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => download("pdf")}
          disabled={downloading !== null}
          className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <FilePdf size={16} weight="fill" />
          {downloading === "pdf" ? "Generating…" : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={() => download("docx")}
          disabled={downloading !== null}
          className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
        >
          <FileDoc size={16} weight="fill" />
          {downloading === "docx" ? "Generating…" : "Download Word"}
        </button>
      </div>
    </div>
  );
}
