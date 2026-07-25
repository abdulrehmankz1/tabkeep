import { MockExpense } from '../data/mockExpenses';
import { expensesToCsv } from '../lib/csvExport';

const BASE: MockExpense = {
  id: '1',
  note: 'Lunch',
  time: '1:20 PM',
  dateGroup: 'Today',
  date: '2026-07-08',
  amount: -85000,
  color: '#8B5CF6',
  icon: 'coffee',
  category: 'Food',
};

describe('expensesToCsv', () => {
  it('includes a header row', () => {
    const csv = expensesToCsv([]);
    expect(csv).toBe('Date,Time,Note,Category,Amount,Source');
  });

  it('formats an expense row with amount in rupees', () => {
    const csv = expensesToCsv([BASE]);
    expect(csv).toBe('Date,Time,Note,Category,Amount,Source\n2026-07-08,1:20 PM,Lunch,Food,-850.00,manual');
  });

  it('excludes expenses that are in the bin', () => {
    const csv = expensesToCsv([{ ...BASE, deletedAt: Date.now() }]);
    expect(csv).toBe('Date,Time,Note,Category,Amount,Source');
  });

  it('quotes fields containing commas', () => {
    const csv = expensesToCsv([{ ...BASE, note: 'Coffee, tea, and snacks' }]);
    expect(csv).toContain('"Coffee, tea, and snacks"');
  });

  it('preserves the OCR source when set', () => {
    const csv = expensesToCsv([{ ...BASE, source: 'ocr' }]);
    expect(csv).toContain(',ocr');
  });
});
