import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MockExpense } from '../data/mockExpenses';
import { MockPerson } from '../data/mockPeople';
import { useExpensesStore } from '../store/useExpensesStore';
import { usePeopleStore } from '../store/usePeopleStore';
import { ThemePreference, useSettingsStore } from '../store/useSettingsStore';

const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  createdAt: string;
  expenses: MockExpense[];
  people: MockPerson[];
  settings: { currencyCode: string; themePreference: ThemePreference };
}

export function createBackupPayload(): BackupPayload {
  const settings = useSettingsStore.getState();
  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    expenses: useExpensesStore.getState().expenses,
    people: usePeopleStore.getState().people,
    settings: { currencyCode: settings.currencyCode, themePreference: settings.themePreference },
  };
}

export function isValidBackupPayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.expenses) &&
    Array.isArray(d.people) &&
    typeof d.settings === 'object' &&
    d.settings !== null &&
    typeof (d.settings as Record<string, unknown>).currencyCode === 'string' &&
    typeof (d.settings as Record<string, unknown>).themePreference === 'string'
  );
}

export async function exportBackup(): Promise<void> {
  const payload = createBackupPayload();
  const file = new File(Paths.cache, 'tabkeep-backup.json');
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
  }
}

export async function importBackup(): Promise<'restored' | 'canceled'> {
  const picked = await File.pickFileAsync({ mimeTypes: 'application/json' });
  if (picked.canceled) return 'canceled';

  const text = await picked.result.text();
  const data = JSON.parse(text);
  if (!isValidBackupPayload(data)) {
    throw new Error('This file is not a valid TabKeep backup.');
  }

  useExpensesStore.setState({ expenses: data.expenses });
  usePeopleStore.setState({ people: data.people });
  useSettingsStore.setState({
    currencyCode: data.settings.currencyCode,
    themePreference: data.settings.themePreference,
  });
  return 'restored';
}
