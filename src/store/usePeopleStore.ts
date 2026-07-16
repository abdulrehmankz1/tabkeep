import { create } from 'zustand';
import { MOCK_PEOPLE, MockPerson, PersonEntry } from '../data/mockPeople';
import { BIN_RETENTION_DAYS, isExpiredInBin } from '../lib/bin';
import { useDialogStore } from './useDialogStore';

interface PeopleState {
  people: MockPerson[];
  addPerson: (name: string, phone?: string) => string;
  addEntry: (personId: string, entry: Omit<PersonEntry, 'id'>) => void;
  moveToBin: (id: string) => void;
  restorePerson: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  purgeExpiredBinItems: () => void;
}

let nextId = MOCK_PEOPLE.length + 1;
let nextEntryId = 100;

export const usePeopleStore = create<PeopleState>((set) => ({
  people: MOCK_PEOPLE,
  addPerson: (name, phone) => {
    const id = String(nextId++);
    set((state) => ({
      people: [...state.people, { id, name, phone, entries: [] }],
    }));
    return id;
  },
  addEntry: (personId, entry) => {
    const id = `e${nextEntryId++}`;
    set((state) => ({
      people: state.people.map((p) =>
        p.id === personId ? { ...p, entries: [{ ...entry, id }, ...p.entries] } : p,
      ),
    }));
  },
  moveToBin: (id) =>
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, deletedAt: Date.now() } : p)),
    })),
  restorePerson: (id) =>
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, deletedAt: undefined } : p)),
    })),
  permanentlyDelete: (id) =>
    set((state) => ({ people: state.people.filter((p) => p.id !== id) })),
  purgeExpiredBinItems: () =>
    set((state) => ({
      people: state.people.filter((p) => !p.deletedAt || !isExpiredInBin(p.deletedAt)),
    })),
}));

export function confirmMoveToBinPerson(id: string, name: string, onDeleted?: () => void) {
  useDialogStore.getState().show({
    title: 'Move to bin?',
    message: `"${name}" and their khata history will move to the Bin and be permanently deleted after ${BIN_RETENTION_DAYS} days.`,
    confirmText: 'Move to Bin',
    destructive: true,
    onConfirm: () => {
      usePeopleStore.getState().moveToBin(id);
      onDeleted?.();
    },
  });
}

export function confirmPermanentDeletePerson(id: string, name: string, onDeleted?: () => void) {
  useDialogStore.getState().show({
    title: 'Delete permanently?',
    message: `"${name}" will be permanently deleted. This cannot be undone.`,
    confirmText: 'Delete forever',
    destructive: true,
    onConfirm: () => {
      usePeopleStore.getState().permanentlyDelete(id);
      onDeleted?.();
    },
  });
}
