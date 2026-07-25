import { create } from 'zustand';
import { MockPerson } from '../data/mockPeople';
import {
  createEntry,
  createPerson,
  fetchAllPeople,
  movePersonToBin,
  NewEntryInput,
  permanentlyDeletePerson,
  purgeExpiredPeople,
  restorePerson as restorePersonInDb,
} from '../db/repositories/people';
import { BIN_RETENTION_DAYS } from '../lib/bin';
import { useDialogStore } from './useDialogStore';

interface PeopleState {
  people: MockPerson[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPerson: (name: string, phone?: string) => Promise<string>;
  addEntry: (personId: string, entry: NewEntryInput) => Promise<void>;
  moveToBin: (id: string) => Promise<void>;
  restorePerson: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  purgeExpiredBinItems: () => Promise<void>;
}

export const usePeopleStore = create<PeopleState>((set) => ({
  people: [],
  hydrated: false,
  hydrate: async () => {
    await purgeExpiredPeople();
    const people = await fetchAllPeople();
    set({ people, hydrated: true });
  },
  addPerson: async (name, phone) => {
    const person = await createPerson(name, phone);
    set((state) => ({ people: [...state.people, person] }));
    return person.id;
  },
  addEntry: async (personId, entry) => {
    const created = await createEntry(personId, entry);
    set((state) => ({
      people: state.people.map((p) =>
        p.id === personId ? { ...p, entries: [created, ...p.entries] } : p,
      ),
    }));
  },
  moveToBin: async (id) => {
    await movePersonToBin(id);
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, deletedAt: Date.now() } : p)),
    }));
  },
  restorePerson: async (id) => {
    await restorePersonInDb(id);
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, deletedAt: undefined } : p)),
    }));
  },
  permanentlyDelete: async (id) => {
    await permanentlyDeletePerson(id);
    set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
  },
  purgeExpiredBinItems: async () => {
    await purgeExpiredPeople();
    const people = await fetchAllPeople();
    set({ people });
  },
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
