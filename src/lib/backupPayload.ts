import type { RawExpenseRecord } from '../db/repositories/expenses';
import type { RawPersonRecord } from '../db/repositories/people';
import type { ThemePreference } from '../store/useSettingsStore';

export interface BackupPayload {
  version: number;
  createdAt: string;
  expenses: RawExpenseRecord[];
  people: RawPersonRecord[];
  settings: { currencyCode: string; themePreference: ThemePreference };
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
