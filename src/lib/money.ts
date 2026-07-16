// All amounts are stored as integers in paisas (Rs. 150.50 -> 15050) to avoid float rounding bugs.

export function formatAmount(paisas: number): string {
  const negative = paisas < 0;
  const rupees = Math.abs(paisas) / 100;
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${negative ? '-' : ''}Rs. ${formatted}`;
}

export function toPaisas(rupees: number): number {
  return Math.round(rupees * 100);
}
