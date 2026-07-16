export type Direction = 'gave' | 'received';

export interface BalanceEntry {
  amount: number; // integer paisas
  direction: Direction;
}

// Positive -> they owe the user ("milne hain"). Negative -> user owes them ("dene hain").
export function calculateBalance(entries: BalanceEntry[]): number {
  return entries.reduce((total, entry) => {
    return entry.direction === 'gave' ? total + entry.amount : total - entry.amount;
  }, 0);
}

export function isSettled(balance: number): boolean {
  return balance === 0;
}
