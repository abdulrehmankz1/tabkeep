import {
  extractAmount,
  extractDate,
  extractMerchant,
  isReceiptReadable,
  OcrBlock,
  parseReceiptText,
  reconstructText,
  suggestCategory,
} from '../lib/receiptParser';

const SUPERSTORE_RECEIPT = `
Al-Fatah Superstore
Gulberg Branch, Lahore
02/07/2026  14:32
Bread                  120.00
Milk 1.5L              350.00
Eggs (dozen)            280.00
Cooking Oil            1200.00
Subtotal               1950.00
Discount                -50.00
Total                  1900.00
Cash Rs. 2000
Change    100
Thank you for shopping
`;

const RESTAURANT_RECEIPT = `
Cafe Zouk
DHA Phase 5, Lahore
Table 4
2 Jul 2026
1x Chicken Karahi        850
1x Naan (2pcs)            80
1x Soft Drink              120
Grand Total: Rs. 1,050
`;

const ELECTRICITY_BILL = `
K-ELECTRIC
Consumer No: 12345678
Billing Month: June 2026
Units Consumed: 320
Amount Due: Rs. 8,450
Due Date: 15-07-2026
`;

const PETROL_RECEIPT = `
Shell Pakistan
Ferozepur Road Filling Station
30-06-2026 09:15
Petrol Premium
Litres: 5.00
Amount: 1,450.00
`;

const BLURRY_RECEIPT = `
%%##@@ ??!!
&&**
`;

const NO_KEYWORD_RECEIPT = `
Corner Store
Main Boulevard
30-06-2026
Item A                    150.00
Item B                    620.00
1450.00
`;

describe('extractAmount', () => {
  it('picks the total line over line items', () => {
    expect(extractAmount(SUPERSTORE_RECEIPT)).toBe(190000);
  });

  it('handles "Grand Total" keyword with currency prefix', () => {
    expect(extractAmount(RESTAURANT_RECEIPT)).toBe(105000);
  });

  it('handles "Amount Due" keyword', () => {
    expect(extractAmount(ELECTRICITY_BILL)).toBe(845000);
  });

  it('handles a bare "Amount:" keyword line', () => {
    expect(extractAmount(PETROL_RECEIPT)).toBe(145000);
  });

  it('falls back to the largest number when no keyword line matches', () => {
    expect(extractAmount(NO_KEYWORD_RECEIPT)).toBe(145000);
  });

  it('returns null when there is no numeric amount', () => {
    expect(extractAmount('no numbers here at all')).toBeNull();
  });
});

describe('extractMerchant', () => {
  it('uses the first meaningful line as the merchant name', () => {
    expect(extractMerchant(SUPERSTORE_RECEIPT)).toBe('Al-Fatah Superstore');
    expect(extractMerchant(RESTAURANT_RECEIPT)).toBe('Cafe Zouk');
  });
});

describe('extractDate', () => {
  it('parses dd/mm/yyyy', () => {
    const date = extractDate(SUPERSTORE_RECEIPT);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(2);
  });

  it('parses "2 Jul 2026" style dates', () => {
    const date = extractDate(RESTAURANT_RECEIPT);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(2);
  });

  it('parses dd-mm-yyyy', () => {
    const date = extractDate(ELECTRICITY_BILL);
    expect(date?.getDate()).toBe(15);
    expect(date?.getMonth()).toBe(6);
  });

  it('returns null when no date pattern is present', () => {
    expect(extractDate('no dates in this text')).toBeNull();
  });
});

describe('suggestCategory', () => {
  it('detects Food from grocery/restaurant keywords', () => {
    expect(suggestCategory(SUPERSTORE_RECEIPT)).toBe('Food');
    expect(suggestCategory(RESTAURANT_RECEIPT)).toBe('Food');
  });

  it('detects Bills from utility keywords', () => {
    expect(suggestCategory(ELECTRICITY_BILL)).toBe('Bills');
  });

  it('detects Transport from fuel keywords', () => {
    expect(suggestCategory(PETROL_RECEIPT)).toBe('Transport');
  });

  it('falls back to Other when nothing matches', () => {
    expect(suggestCategory('random text with no category hints 123')).toBe('Other');
  });
});

describe('isReceiptReadable', () => {
  function blocksFor(text: string) {
    return text
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text }));
  }

  it('accepts a clear receipt with enough text blocks and a valid amount', () => {
    expect(isReceiptReadable(SUPERSTORE_RECEIPT, blocksFor(SUPERSTORE_RECEIPT))).toBe(true);
  });

  it('rejects text with too few blocks', () => {
    expect(isReceiptReadable('Total 100', blocksFor('Total 100'))).toBe(false);
  });

  it('rejects garbled OCR output', () => {
    expect(isReceiptReadable(BLURRY_RECEIPT, blocksFor(BLURRY_RECEIPT))).toBe(false);
  });

  it('rejects text with enough blocks but no discernible amount', () => {
    const text = 'Line one\nLine two\nLine three\nLine four\nLine five\nLine six';
    expect(isReceiptReadable(text, blocksFor(text))).toBe(false);
  });
});

describe('reconstructText', () => {
  // Simulates ML Kit splitting a two-column receipt (labels vs. prices) into separate blocks —
  // the exact failure mode that misread "Total 84.80" as a lone "8480".
  const TWO_COLUMN_BLOCKS: OcrBlock[] = [
    {
      lines: [
        { text: 'CASH RECEIPT', top: 10, left: 20, height: 20 },
        { text: 'Total', top: 300, left: 20, height: 20 },
        { text: 'Sub-total', top: 340, left: 20, height: 20 },
        { text: 'Balance', top: 380, left: 20, height: 20 },
      ],
    },
    {
      lines: [
        { text: '84.80', top: 302, left: 300, height: 20 },
        { text: '76.80', top: 341, left: 300, height: 20 },
        { text: '84.80', top: 379, left: 300, height: 20 },
      ],
    },
  ];

  it('merges label and price columns into the same row, ordered left-to-right', () => {
    const text = reconstructText(TWO_COLUMN_BLOCKS);
    const lines = text.split('\n');
    expect(lines).toContain('Total  84.80');
    expect(lines).toContain('Sub-total  76.80');
    expect(lines).toContain('Balance  84.80');
  });

  it('keeps rows in top-to-bottom order regardless of block order', () => {
    const text = reconstructText(TWO_COLUMN_BLOCKS);
    const lines = text.split('\n');
    expect(lines[0]).toBe('CASH RECEIPT');
    expect(lines.indexOf('Total  84.80')).toBeLessThan(lines.indexOf('Sub-total  76.80'));
    expect(lines.indexOf('Sub-total  76.80')).toBeLessThan(lines.indexOf('Balance  84.80'));
  });

  it('extracts the correct total once rows are reconstructed', () => {
    const text = reconstructText(TWO_COLUMN_BLOCKS);
    expect(extractAmount(text)).toBe(8480);
  });

  it('would have misread the amount without reconstruction (regression check)', () => {
    // A receipt number sitting in the label column with the true total isolated in the price
    // column: block order alone would let the unrelated "48210" get mistaken for the amount.
    const blocks: OcrBlock[] = [
      {
        lines: [
          { text: 'Receipt #48210', top: 10, left: 20, height: 20 },
          { text: 'Total', top: 300, left: 20, height: 20 },
        ],
      },
      { lines: [{ text: '84.80', top: 302, left: 300, height: 20 }] },
    ];

    const flattened = blocks.flatMap((b) => b.lines.map((l) => l.text)).join('\n');
    expect(extractAmount(flattened)).not.toBe(8480);

    const reconstructed = reconstructText(blocks);
    expect(extractAmount(reconstructed)).toBe(8480);
  });

  it('returns an empty string for no blocks', () => {
    expect(reconstructText([])).toBe('');
  });
});

describe('parseReceiptText integration', () => {
  it('correctly parses a reconstructed two-column receipt end to end', () => {
    const text = reconstructText([
      {
        lines: [
          { text: 'Cafe Zouk', top: 10, left: 20, height: 20 },
          { text: 'Total', top: 200, left: 20, height: 20 },
        ],
      },
      {
        lines: [{ text: 'Rs. 1,050', top: 202, left: 300, height: 20 }],
      },
    ]);
    const parsed = parseReceiptText(text);
    expect(parsed.amountPaisas).toBe(105000);
    expect(parsed.merchant).toBe('Cafe Zouk');
    expect(parsed.category).toBe('Food');
  });
});
