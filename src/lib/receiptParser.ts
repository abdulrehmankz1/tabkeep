export interface TextBlock {
  text: string;
}

export interface OcrLine {
  text: string;
  top: number;
  left: number;
  height: number;
}

export interface OcrBlock {
  lines: OcrLine[];
}

// ML Kit groups recognized text into blocks by visual proximity, which frequently splits a
// receipt's label column ("Total") from its price column ("84.80") into separate blocks —
// scrambling the flattened `.text` reading order. Rebuild real visual rows from each line's
// bounding box instead: group lines whose vertical center overlaps into one row, then order
// left-to-right within that row.
export function reconstructText(blocks: OcrBlock[]): string {
  const lines = blocks.flatMap((b) => b.lines).filter((l) => l.text.trim().length > 0);
  if (lines.length === 0) return '';

  const sorted = [...lines].sort((a, b) => a.top - b.top);
  const rows: OcrLine[][] = [];

  for (const line of sorted) {
    const row = rows[rows.length - 1];
    const ref = row?.[0];
    const sameRow = ref && Math.abs(line.top - ref.top) < Math.max(line.height, ref.height, 1) * 0.6;
    if (row && sameRow) {
      row.push(line);
    } else {
      rows.push([line]);
    }
  }

  return rows
    .map((row) => row.sort((a, b) => a.left - b.left).map((l) => l.text).join('  '))
    .join('\n');
}

export interface ParsedReceipt {
  amountPaisas: number | null;
  merchant: string | null;
  date: Date | null;
  category: string;
}

const SUBTOTAL_PATTERN = /sub[\s-]?total/i;
const TOTAL_KEYWORDS = /(grand\s*total|total\s*amount|net\s*total|total|amount\s*due|amount\s*payable|amount|balance)/i;
const AMOUNT_PATTERN = /(?:rs\.?|pkr|₨)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i;

const CATEGORY_KEYWORDS: { category: string; keywords: RegExp }[] = [
  { category: 'Food', keywords: /(restaurant|cafe|coffee|food|kitchen|bakery|biryani|pizza|burger|superstore|mart|grocery)/i },
  { category: 'Bills', keywords: /(electric|electricity|k-?electric|wapda|gas|sui|internet|wifi|ptcl|utility|bill)/i },
  { category: 'Transport', keywords: /(petrol|fuel|cng|careem|uber|indrive|filling station|pso|shell|total parco)/i },
  { category: 'Rent', keywords: /(rent|lease)/i },
];

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function parseAmountFromLine(line: string): number | null {
  const match = line.match(AMOUNT_PATTERN);
  if (!match) return null;
  const cleaned = match[1].replace(/,/g, '');
  const value = parseFloat(cleaned);
  if (Number.isNaN(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function extractAmount(text: string): number | null {
  const lines = toLines(text);

  // Prefer lines that mention a total/amount keyword; last match wins (grand total usually at the bottom).
  // "Sub-total" is excluded — it precedes tax/discount and is never the final payable amount.
  let keywordAmount: number | null = null;
  for (const line of lines) {
    if (SUBTOTAL_PATTERN.test(line)) continue;
    if (TOTAL_KEYWORDS.test(line)) {
      const amount = parseAmountFromLine(line);
      if (amount !== null) keywordAmount = amount;
    }
  }
  if (keywordAmount !== null) return keywordAmount;

  // Fallback: largest currency-like number anywhere in the receipt.
  let largest: number | null = null;
  for (const line of lines) {
    const amount = parseAmountFromLine(line);
    if (amount !== null && (largest === null || amount > largest)) largest = amount;
  }
  return largest;
}

export function extractMerchant(text: string): string | null {
  const lines = toLines(text);
  const first = lines.find((l) => l.length >= 3 && !/^\d+$/.test(l));
  return first ?? null;
}

const DATE_PATTERNS: { regex: RegExp; parse: (m: RegExpMatchArray) => Date | null }[] = [
  {
    // 02/07/2026, 2-7-26, 02.07.2026
    regex: /\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})\b/,
    parse: (m) => {
      const day = Number(m[1]);
      const month = Number(m[2]);
      let year = Number(m[3]);
      if (year < 100) year += 2000;
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    },
  },
  {
    // 2026-07-02
    regex: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
    parse: (m) => {
      const year = Number(m[1]);
      const month = Number(m[2]);
      const day = Number(m[3]);
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    },
  },
  {
    // 2 Jul 2026 / 2 July 2026
    regex: /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i,
    parse: (m) => {
      const day = Number(m[1]);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = months.indexOf(m[2].toLowerCase());
      let year = Number(m[3]);
      if (year < 100) year += 2000;
      if (month === -1) return null;
      return new Date(year, month, day);
    },
  },
];

export function extractDate(text: string): Date | null {
  for (const { regex, parse } of DATE_PATTERNS) {
    const match = text.match(regex);
    if (match) {
      const date = parse(match);
      if (date && !Number.isNaN(date.getTime())) return date;
    }
  }
  return null;
}

export function suggestCategory(text: string): string {
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.test(text)) return category;
  }
  return 'Other';
}

export function parseReceiptText(text: string): ParsedReceipt {
  return {
    amountPaisas: extractAmount(text),
    merchant: extractMerchant(text),
    date: extractDate(text),
    category: suggestCategory(text),
  };
}

// Quality heuristics from the receipt-OCR spec: too few text blocks, no amount pattern,
// or too much garbage means the photo should be retaken rather than trusted.
export function isReceiptReadable(text: string, blocks: TextBlock[]): boolean {
  if (blocks.length < 5) return false;
  if (extractAmount(text) === null) return false;

  const meaningfulChars = text.replace(/\s/g, '');
  if (meaningfulChars.length === 0) return false;
  const garbageChars = meaningfulChars.replace(/[a-zA-Z0-9.,\-/:₨]/g, '');
  const garbageRatio = garbageChars.length / meaningfulChars.length;
  if (garbageRatio > 0.35) return false;

  return true;
}
