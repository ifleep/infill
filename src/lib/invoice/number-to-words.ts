// Converts a whole-rupee PKR amount to words for the invoice's "amount in
// words" line, matching the real INFiLL PK template's convention
// (Western thousand/million grouping, e.g. "Four Hundred Thirty Thousand
// Rupees only" for 430,000 — not Lakh/Crore grouping).

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)], "Hundred");
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    n %= 10;
    if (n) parts.push(ONES[n]);
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

export function numberToWordsPKR(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return "Zero Rupees only";

  const groups: [number, string][] = [
    [1_000_000_000, "Billion"],
    [1_000_000, "Million"],
    [1_000, "Thousand"],
  ];

  let remaining = n;
  const words: string[] = [];
  for (const [value, label] of groups) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value);
      words.push(threeDigitsToWords(count), label);
      remaining %= value;
    }
  }
  if (remaining > 0) {
    words.push(threeDigitsToWords(remaining));
  }

  return `${words.join(" ")} Rupees only`;
}
