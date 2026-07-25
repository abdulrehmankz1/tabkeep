import { create } from 'zustand';
import { MOCK_EXPENSES, MockExpense } from '../data/mockExpenses';
import { BIN_RETENTION_DAYS, isExpiredInBin } from '../lib/bin';
import { useDialogStore } from './useDialogStore';

interface ExpensesState {
  expenses: MockExpense[];
  addExpense: (input: Omit<MockExpense, 'id'>) => string;
  moveToBin: (id: string) => void;
  restoreExpense: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  purgeExpiredBinItems: () => void;
}

let nextId = MOCK_EXPENSES.length + 1;

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: MOCK_EXPENSES,
  addExpense: (input) => {
    const id = String(nextId++);
    set((state) => ({ expenses: [{ ...input, id }, ...state.expenses] }));
    return id;
  },
  moveToBin: (id) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, deletedAt: Date.now() } : e)),
    })),
  restoreExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, deletedAt: undefined } : e)),
    })),
  permanentlyDelete: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  purgeExpiredBinItems: () =>
    set((state) => ({
      expenses: state.expenses.filter((e) => !e.deletedAt || !isExpiredInBin(e.deletedAt)),
    })),
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
