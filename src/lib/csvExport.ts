import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MockExpense } from '../data/mockExpenses';

const CSV_HEADER = ['Date', 'Time', 'Note', 'Category', 'Amount', 'Source'];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: MockExpense[]): string {
  const rows = expenses
    .filter((e) => !e.deletedAt)
    .map((e) => [
      e.date,
      e.time,
      e.note,
      e.category,
      (e.amount / 100).toFixed(2),
      e.source ?? 'manual',
    ]);

  return [CSV_HEADER, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

export async function exportExpensesCsv(expenses: MockExpense[]): Promise<void> {
  const csv = expensesToCsv(expenses);
  const file = new File(Paths.cache, 'tabkeep-expenses.csv');
  file.create({ overwrite: true });
  file.write(csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
  }
}
