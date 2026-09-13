export function LegalNotice() {
  return (
    <p className="mt-4 rounded-md border border-dashed border-border-strong bg-surface-sunken px-4 py-3 text-xs text-ink-muted">
      This page is a standard placeholder template pending final legal review and is not yet
      INFiLLPK&rsquo;s confirmed policy.
    </p>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-ink-muted">{children}</p>
    </section>
  );
}
