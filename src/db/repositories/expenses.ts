import { Q } from '@nozbe/watermelondb';
import { MockExpense } from '../../data/mockExpenses';
import { isExpiredInBin } from '../../lib/bin';
import { CATEGORY_META } from '../../lib/categoryMeta';
import { dateGroupFor, isoDateFor, formatDisplayTime } from '../../lib/dateGroup';
import { currentUserId } from '../currentUser';
import { database } from '../index';
import Expense from '../models/Expense';

export interface NewExpenseInput {
  note: string;
  category: string;
  amount: number; // integer paisas, negative for spend
  occurredAt: Date;
  source: 'manual' | 'ocr';
  receiptImage?: string;
}

export interface RawExpenseRecord {
  amount: number;
  category: string;
  note?: string;
  occurredAt: string; // ISO
  source: 'manual' | 'ocr';
  receiptImage?: string;
  createdAt: string; // ISO
  deletedAt?: number;
}

const collection = () => database.get<Expense>('expenses');

function toMockExpense(record: Expense): MockExpense {
  const meta = CATEGORY_META[record.category] ?? CATEGORY_META.Other;
  return {
    id: record.id,
    note: record.note ?? record.category,
    time: formatDisplayTime(record.occurredAt),
    dateGroup: dateGroupFor(record.occurredAt),
    date: isoDateFor(record.occurredAt),
    amount: record.amount,
    color: meta.color,
    icon: meta.icon,
    category: record.category,
    source: record.source,
    receiptImage: record.receiptImage,
    deletedAt: record.deletedAt,
  };
}

export async function fetchAllExpenses(): Promise<MockExpense[]> {
  const records = await collection()
    .query(Q.where('user_id', currentUserId() ?? ''), Q.sortBy('created_at', Q.desc))
    .fetch();
  return records.map(toMockExpense);
}

export async function createExpense(input: NewExpenseInput, createdAt: Date = new Date()): Promise<MockExpense> {
  let created!: Expense;
  await database.write(async () => {
    created = await collection().create((e) => {
      e.userId = currentUserId();
      e.amount = input.amount;
      e.category = input.category;
      e.note = input.note;
      e.occurredAt = input.occurredAt;
      e.source = input.source;
      e.receiptImage = input.receiptImage;
      e.createdAt = createdAt;
    });
  });
  return toMockExpense(created);
}

export async function moveExpenseToBin(id: string): Promise<void> {
  await database.write(async () => {
    const record = await collection().find(id);
    await record.update((e) => {
      e.deletedAt = Date.now();
    });
  });
}

export async function restoreExpense(id: string): Promise<void> {
  await database.write(async () => {
    const record = await collection().find(id);
    await record.update((e) => {
      e.deletedAt = undefined;
    });
  });
}

export async function permanentlyDeleteExpense(id: string): Promise<void> {
  await database.write(async () => {
    const record = await collection().find(id);
    await record.destroyPermanently();
  });
}

export async function purgeExpiredExpenses(): Promise<void> {
  const binned = await collection()
    .query(Q.where('user_id', currentUserId() ?? ''), Q.where('deleted_at', Q.notEq(null)))
    .fetch();
  const expired = binned.filter((r) => r.deletedAt !== undefined && isExpiredInBin(r.deletedAt));
  if (expired.length === 0) return;
  await database.write(async () => {
    await database.batch(...expired.map((r) => r.prepareDestroyPermanently()));
  });
}

export async function fetchAllExpensesRaw(): Promise<RawExpenseRecord[]> {
  const records = await collection().query(Q.where('user_id', currentUserId() ?? '')).fetch();
  return records.map((r) => ({
    amount: r.amount,
    category: r.category,
    note: r.note,
    occurredAt: r.occurredAt.toISOString(),
    source: r.source,
    receiptImage: r.receiptImage,
    createdAt: r.createdAt.toISOString(),
    deletedAt: r.deletedAt,
  }));
}

export async function replaceAllExpenses(records: RawExpenseRecord[]): Promise<void> {
  const existing = await collection().query(Q.where('user_id', currentUserId() ?? '')).fetch();
  await database.write(async () => {
    await database.batch(
      ...existing.map((r) => r.prepareDestroyPermanently()),
      ...records.map((input) =>
        collection().prepareCreate((e) => {
          e.userId = currentUserId();
          e.amount = input.amount;
          e.category = input.category;
          e.note = input.note;
          e.occurredAt = new Date(input.occurredAt);
          e.source = input.source;
          e.receiptImage = input.receiptImage;
          e.createdAt = new Date(input.createdAt);
          e.deletedAt = input.deletedAt;
        }),
      ),
    );
  });
}
