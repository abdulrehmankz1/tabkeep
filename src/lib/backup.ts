import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fetchAllExpensesRaw, replaceAllExpenses } from '../db/repositories/expenses';
import { fetchAllPeopleRaw, replaceAllPeople } from '../db/repositories/people';
import { scheduleSync } from '../db/sync';
import { useExpensesStore } from '../store/useExpensesStore';
import { usePeopleStore } from '../store/usePeopleStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { BackupPayload, isValidBackupPayload } from './backupPayload';

export { BackupPayload, isValidBackupPayload } from './backupPayload';

const BACKUP_VERSION = 1;

export async function createBackupPayload(): Promise<BackupPayload> {
  const settings = useSettingsStore.getState();
  const [expenses, people] = await Promise.all([fetchAllExpensesRaw(), fetchAllPeopleRaw()]);
  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    expenses,
    people,
    settings: { currencyCode: settings.currencyCode, themePreference: settings.themePreference },
  };
}

export async function exportBackup(): Promise<void> {
  const payload = await createBackupPayload();
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

  await Promise.all([replaceAllExpenses(data.expenses), replaceAllPeople(data.people)]);
  useSettingsStore.setState({
    currencyCode: data.settings.currencyCode,
    themePreference: data.settings.themePreference,
  });
  await Promise.all([useExpensesStore.getState().hydrate(), usePeopleStore.getState().hydrate()]);
  scheduleSync();
  return 'restored';
}
