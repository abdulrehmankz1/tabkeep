import { getCurrentCurrency } from '../store/useSettingsStore';

// All amounts are stored as integers in "minor units" of the selected currency (Rs. 150.50 -> 15050)
// to avoid float rounding bugs. Switching currency only changes the displayed symbol/formatting —
// there is no live exchange-rate conversion of the underlying number.

export function formatAmount(paisas: number): string {
  const currency = getCurrentCurrency();
  const negative = paisas < 0;
  const units = Math.abs(paisas) / 100;
  const formatted = units.toLocaleString(currency.locale, {
    minimumFractionDigits: units % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${negative ? '-' : ''}${currency.symbol} ${formatted}`;
}

export function toPaisas(rupees: number): number {
  return Math.round(rupees * 100);
}
