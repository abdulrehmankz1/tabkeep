function monthKey(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  return `${year}-${month - 1}`;
}

function currentMonthKey(monthsAgo = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function isInMonth(dateStr: string, monthsAgo = 0): boolean {
  return monthKey(dateStr) === currentMonthKey(monthsAgo);
}

export function monthName(monthsAgo = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString('en-US', { month: 'long' });
}

export function monthYearLabel(monthsAgo = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Days to divide "daily average" by: elapsed days if viewing the current month, full month length otherwise.
export function daysForAverage(monthsAgo = 0): number {
  const now = new Date();
  if (monthsAgo === 0) return now.getDate();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
  return d.getDate();
}
