import { create } from 'zustand';
import { MockExpense } from '../data/mockExpenses';
import {
  createExpense,
  fetchAllExpenses,
  moveExpenseToBin,
  NewExpenseInput,
  permanentlyDeleteExpense,
  purgeExpiredExpenses,
  restoreExpense as restoreExpenseInDb,
} from '../db/repositories/expenses';
import { BIN_RETENTION_DAYS } from '../lib/bin';
import { useDialogStore } from './useDialogStore';

interface ExpensesState {
  expenses: MockExpense[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addExpense: (input: NewExpenseInput) => Promise<string>;
  moveToBin: (id: string) => Promise<void>;
  restoreExpense: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  purgeExpiredBinItems: () => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: [],
  hydrated: false,
  hydrate: async () => {
    await purgeExpiredExpenses();
    const expenses = await fetchAllExpenses();
    set({ expenses, hydrated: true });
  },
  addExpense: async (input) => {
    const expense = await createExpense(input);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense.id;
  },
  moveToBin: async (id) => {
    await moveExpenseToBin(id);
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, deletedAt: Date.now() } : e)),
    }));
  },
  restoreExpense: async (id) => {
    await restoreExpenseInDb(id);
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, deletedAt: undefined } : e)),
    }));
  },
  permanentlyDelete: async (id) => {
    await permanentlyDeleteExpense(id);
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
  },
  purgeExpiredBinItems: async () => {
    await purgeExpiredExpenses();
    const expenses = await fetchAllExpenses();
    set({ expenses });
  },
}));

export function confirmMoveToBin(id: string, note: string, onDeleted?: () => void) {
  useDialogStore.getState().show({
    title: 'Move to bin?',
    message: `"${note}" will move to the Bin and be permanently deleted after ${BIN_RETENTION_DAYS} days.`,
    confirmText: 'Move to Bin',
    destructive: true,
    onConfirm: () => {
      useExpensesStore.getState().moveToBin(id);
      onDeleted?.();
    },
  });
}

export function confirmPermanentDelete(id: string, note: string, onDeleted?: () => void) {
  useDialogStore.getState().show({
    title: 'Delete permanently?',
    message: `"${note}" will be permanently deleted. This cannot be undone.`,
    confirmText: 'Delete forever',
    destructive: true,
    onConfirm: () => {
      useExpensesStore.getState().permanentlyDelete(id);
      onDeleted?.();
    },
  });
}
