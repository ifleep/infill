"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import type { BankAccount } from "@/lib/data/settings";

const inputClass =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

export function BankAccountsManager({
  accounts,
  onChange,
}: {
  accounts: BankAccount[];
  onChange: (accounts: BankAccount[]) => void;
}) {
  function update(index: number, patch: Partial<BankAccount>) {
    const next = [...accounts];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function add() {
    onChange([...accounts, { id: newId(), label: "", accountTitle: "", bankName: "", iban: "" }]);
  }

  function remove(index: number) {
    onChange(accounts.filter((_, i) => i !== index));
  }

  return (
    <div>
      <h2 className="font-display text-base font-semibold text-ink">Bank accounts</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Saved accounts you can pick from when generating an order invoice, so you don&apos;t retype IBAN details
        every time.
      </p>

      <div className="mt-4 space-y-4">
        {accounts.map((acc, i) => (
          <div key={acc.id} className="rounded-lg border border-border-strong p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-faint">Account {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="focus-ring inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash size={14} /> Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-ink-muted">
                  Label (shown in the picker, e.g. &quot;Standard Chartered — Ahsan&quot;)
                </span>
                <input
                  value={acc.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-ink-muted">Account title</span>
                <input
                  value={acc.accountTitle}
                  onChange={(e) => update(i, { accountTitle: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-ink-muted">Bank name</span>
                <input
                  value={acc.bankName}
                  onChange={(e) => update(i, { bankName: e.target.value })}
                  placeholder="Standard Chartered Bank, Karachi"
                  className={inputClass}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-ink-muted">IBAN</span>
                <input
                  value={acc.iban}
                  onChange={(e) => update(i, { iban: e.target.value })}
                  placeholder="PK31SCBL0000001160714201"
                  className={`${inputClass} tabular`}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="focus-ring mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600"
      >
        <Plus size={16} /> Add bank account
      </button>
    </div>
  );
}
