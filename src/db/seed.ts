import { MOCK_EXPENSES } from '../data/mockExpenses';
import { MOCK_PEOPLE } from '../data/mockPeople';
import { createExpense, fetchAllExpenses } from './repositories/expenses';
import { createEntry, createPerson, fetchAllPeople } from './repositories/people';

// Seeds the demo data used before persistence existed, so a fresh install
// doesn't look empty. Only runs once — skipped as soon as either table has rows.
export async function seedIfEmpty(): Promise<void> {
  const [expenses, people] = await Promise.all([fetchAllExpenses(), fetchAllPeople()]);

  if (expenses.length === 0) {
    const reversed = [...MOCK_EXPENSES].reverse();
    const base = Date.now() - reversed.length * 1000;
    for (let i = 0; i < reversed.length; i++) {
      const e = reversed[i];
      await createExpense(
        {
          note: e.note,
          category: e.category,
          amount: e.amount,
          occurredAt: new Date(`${e.date}T12:00:00`),
          source: e.source ?? 'manual',
          receiptImage: e.receiptImage,
        },
        new Date(base + i * 1000),
      );
    }
  }

  if (people.length === 0) {
    let dayOffset = 0;
    for (const p of MOCK_PEOPLE) {
      const person = await createPerson(p.name, p.phone);
      const reversedEntries = [...p.entries].reverse();
      const base = Date.now() - reversedEntries.length * 1000;
      for (let i = 0; i < reversedEntries.length; i++) {
        const entry = reversedEntries[i];
        dayOffset += 1;
        await createEntry(
          person.id,
          {
            amount: entry.amount,
            direction: entry.direction,
            note: entry.note,
            occurredAt: new Date(Date.now() - dayOffset * 86400000),
          },
          new Date(base + i * 1000),
        );
      }
    }
  }
}
