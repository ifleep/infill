// Customer-entered names, addresses and city names on orders are often
// typed in all caps, all lowercase, or with ragged whitespace — invoices
// are a formal document shown back to the customer, so we clean up the
// *display* copy here without ever touching the stored order data itself
// (the order record stays exactly as the customer typed it).

const LOWERCASE_PARTICLES = new Set(["bin", "binte", "al", "el", "of", "and", "the"]);

// Common Pakistani address abbreviations that should stay upper- or
// mixed-case rather than being title-cased word by word.
const FIXED_CASE_WORDS: Record<string, string> = {
  dha: "DHA",
  pecs: "PECHS",
  pechs: "PECHS",
  g: "G",
  f: "F",
  i: "I",
  e: "E",
  cda: "CDA",
};

function titleCaseWord(word: string): string {
  const lower = word.toLowerCase();
  if (FIXED_CASE_WORDS[lower]) return FIXED_CASE_WORDS[lower];
  if (LOWERCASE_PARTICLES.has(lower)) return lower;
  // Keep hyphenated and slashed segments each capitalized (e.g. "G-9/4", "Gulberg-III")
  return word
    .split(/([-/])/)
    .map((part) => {
      if (part === "-" || part === "/") return part;
      if (/^\d/.test(part)) return part.toUpperCase(); // roman numerals / block numbers like "III", "9/4"
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

/** Collapses ragged whitespace and title-cases free text (names, address lines, city names). */
export function cleanDisplayText(input: string | null | undefined): string {
  if (!input) return "";
  const collapsed = input.trim().replace(/\s+/g, " ");
  if (!collapsed) return "";
  // Always normalize per word — real order data is far more often
  // inconsistently-cased ("MANSOOR shauqat", "islamabad, ISLAMABAD") than
  // it is a deliberately mixed-case proper noun, and FIXED_CASE_WORDS /
  // LOWERCASE_PARTICLES above already carve out the common exceptions
  // (DHA, PECHS, bin, al, ...) that a blind re-casing pass would otherwise
  // get wrong.
  return collapsed
    .split(" ")
    .map((w) => (w ? titleCaseWord(w) : w))
    .join(" ");
}

/** Cleans a phone number down to a consistent "+92 3XX XXXXXXX"-style display, best-effort. */
export function cleanDisplayPhone(input: string | null | undefined): string {
  if (!input) return "";
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return input.trim();
  // Normalize to local-with-country-code digits, e.g. "923225042809"
  let normalized = digits;
  if (normalized.startsWith("0")) normalized = "92" + normalized.slice(1);
  else if (!normalized.startsWith("92")) normalized = "92" + normalized;
  if (normalized.length !== 12) return input.trim(); // not a recognizable PK mobile — leave as typed
  return `+${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5)}`;
}

/** Cleans a multi-line address block (one cleanDisplayText pass per non-empty line). */
export function cleanDisplayAddressLines(lines: Array<string | null | undefined>): string[] {
  return lines.map((l) => cleanDisplayText(l)).filter((l) => l.length > 0);
}
