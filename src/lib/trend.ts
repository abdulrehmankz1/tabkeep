export interface SpendTrend {
  text: string;
  good: boolean;
}

export function spendTrend(thisTotal: number, lastTotal: number, lastMonthLabel: string): SpendTrend | null {
  if (lastTotal === 0) return null;
  const pct = Math.round((Math.abs(thisTotal - lastTotal) / lastTotal) * 100);
  const good = thisTotal <= lastTotal;
  return {
    text: `${good ? '↓' : '↑'} ${pct}% ${good ? 'less' : 'more'} than ${lastMonthLabel}`,
    good,
  };
}
