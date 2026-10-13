// "Rs" (Intl's default PKR symbol) is ambiguous with Indian Rupees, which
// Google and other crawlers/readers default to far more often — spelling
// out "PKR" removes that ambiguity everywhere a price is shown.
export function formatPKR(amount: number): string {
  const number = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount);
  return `PKR ${number}`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}
