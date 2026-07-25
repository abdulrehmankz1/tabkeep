import { Q } from '@nozbe/watermelondb';
import { MockPerson, PersonEntry } from '../../data/mockPeople';
import { isExpiredInBin } from '../../lib/bin';
import { formatDisplayDate, formatDisplayTime } from '../../lib/dateGroup';
import { database } from '../index';
import Person from '../models/Person';
import Transaction from '../models/Transaction';

export interface NewEntryInput {
  amount: number; // integer paisas
  direction: 'gave' | 'received';
  note?: string;
  occurredAt: Date;
}

export interface RawEntryRecord {
  amount: number;
  direction: 'gave' | 'received';
  note?: string;
  occurredAt: string; // ISO
  createdAt: string; // ISO
}

export interface RawPersonRecord {
  name: string;
  phone?: string;
  createdAt: string; // ISO
  deletedAt?: number;
  entries: RawEntryRecord[];
}

const people = () => database.get<Person>('people');
const transactions = () => database.get<Transaction>('transactions');

function toEntry(record: Transaction): PersonEntry {
  return {
    id: record.id,
    amount: record.amount,
    direction: record.direction,
    note: record.note,
    date: formatDisplayDate(record.occurredAt),
    time: formatDisplayTime(record.occurredAt),
  };
}

export async function fetchAllPeople(): Promise<MockPerson[]> {
  const [personRecords, entryRecords] = await Promise.all([
    people().query(Q.sortBy('created_at', Q.desc)).fetch(),
    transactions().query(Q.sortBy('created_at', Q.desc)).fetch(),
  ]);

  const entriesByPerson = new Map<string, PersonEntry[]>();
  for (const record of entryRecords) {
    const list = entriesByPerson.get(record.personId) ?? [];
    list.push(toEntry(record));
    entriesByPerson.set(record.personId, list);
  }

  return personRecords.map((record) => ({
    id: record.id,
    name: record.name,
    phone: record.phone,
    entries: entriesByPerson.get(record.id) ?? [],
    deletedAt: record.deletedAt,
  }));
}

export async function createPerson(name: string, phone?: string, createdAt: Date = new Date()): Promise<MockPerson> {
  let created!: Person;
  await database.write(async () => {
    created = await people().create((p) => {
      p.name = name;
      p.phone = phone;
      p.createdAt = createdAt;
    });
  });
  return { id: created.id, name: created.name, phone: created.phone, entries: [] };
}

export async function createEntry(
  personId: string,
  input: NewEntryInput,
  createdAt: Date = new Date(),
): Promise<PersonEntry> {
  let created!: Transaction;
  await database.write(async () => {
    created = await transactions().create((t) => {
      t.personId = personId;
      t.amount = input.amount;
      t.direction = input.direction;
      t.note = input.note;
      t.occurredAt = input.occurredAt;
      t.createdAt = createdAt;
    });
  });
  return toEntry(created);
}

export async function movePersonToBin(id: string): Promise<void> {
  await database.write(async () => {
    const record = await people().find(id);
    await record.update((p) => {
      p.deletedAt = Date.now();
    });
  });
}

export async function restorePerson(id: string): Promise<void> {
  await database.write(async () => {
    const record = await people().find(id);
    await record.update((p) => {
      p.deletedAt = undefined;
    });
  });
}

export async function permanentlyDeletePerson(id: string): Promise<void> {
  const entryRecords = await transactions().query(Q.where('person_id', id)).fetch();
  await database.write(async () => {
    const record = await people().find(id);
    await database.batch(
      record.prepareDestroyPermanently(),
      ...entryRecords.map((r) => r.prepareDestroyPermanently()),
    );
  });
}

export async function purgeExpiredPeople(): Promise<void> {
  const binned = await people().query(Q.where('deleted_at', Q.notEq(null))).fetch();
  const expired = binned.filter((r) => r.deletedAt !== undefined && isExpiredInBin(r.deletedAt));
  if (expired.length === 0) return;

  const expiredEntries = await Promise.all(
    expired.map((r) => transactions().query(Q.where('person_id', r.id)).fetch()),
  );

  await database.write(async () => {
    await database.batch(
      ...expired.map((r) => r.prepareDestroyPermanently()),
      ...expiredEntries.flat().map((r) => r.prepareDestroyPermanently()),
    );
  });
}

export async function fetchAllPeopleRaw(): Promise<RawPersonRecord[]> {
  const [personRecords, entryRecords] = await Promise.all([
    people().query().fetch(),
    transactions().query().fetch(),
  ]);

  const entriesByPerson = new Map<string, RawEntryRecord[]>();
  for (const r of entryRecords) {
    const list = entriesByPerson.get(r.personId) ?? [];
    list.push({
      amount: r.amount,
      direction: r.direction,
      note: r.note,
      occurredAt: r.occurredAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    });
    entriesByPerson.set(r.personId, list);
  }

  return personRecords.map((r) => ({
    name: r.name,
    phone: r.phone,
    createdAt: r.createdAt.toISOString(),
    deletedAt: r.deletedAt,
    entries: entriesByPerson.get(r.id) ?? [],
  }));
}

export async function replaceAllPeople(records: RawPersonRecord[]): Promise<void> {
  const [existingPeople, existingEntries] = await Promise.all([
    people().query().fetch(),
    transactions().query().fetch(),
  ]);

  await database.write(async () => {
    const newPeople = records.map((input) =>
      people().prepareCreate((p) => {
        p.name = input.name;
        p.phone = input.phone;
        p.createdAt = new Date(input.createdAt);
        p.deletedAt = input.deletedAt;
      }),
    );
    const newEntries = records.flatMap((input, i) =>
      input.entries.map((entry) =>
        transactions().prepareCreate((t) => {
          t.personId = newPeople[i].id;
          t.amount = entry.amount;
          t.direction = entry.direction;
          t.note = entry.note;
          t.occurredAt = new Date(entry.occurredAt);
          t.createdAt = new Date(entry.createdAt);
        }),
      ),
    );
    await database.batch(
      ...existingPeople.map((r) => r.prepareDestroyPermanently()),
      ...existingEntries.map((r) => r.prepareDestroyPermanently()),
      ...newPeople,
      ...newEntries,
    );
  });
}
