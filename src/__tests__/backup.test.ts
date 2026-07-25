import { isValidBackupPayload } from '../lib/backupPayload';

describe('isValidBackupPayload', () => {
  it('accepts a well-formed payload', () => {
    expect(
      isValidBackupPayload({
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        expenses: [],
        people: [],
        settings: { currencyCode: 'PKR', themePreference: 'dark' },
      }),
    ).toBe(true);
  });

  it('rejects null and non-objects', () => {
    expect(isValidBackupPayload(null)).toBe(false);
    expect(isValidBackupPayload('not a backup')).toBe(false);
    expect(isValidBackupPayload(42)).toBe(false);
  });

  it('rejects a payload missing expenses or people arrays', () => {
    expect(isValidBackupPayload({ people: [], settings: { currencyCode: 'PKR', themePreference: 'dark' } })).toBe(false);
    expect(isValidBackupPayload({ expenses: [], settings: { currencyCode: 'PKR', themePreference: 'dark' } })).toBe(false);
  });

  it('rejects a payload with a malformed settings object', () => {
    expect(isValidBackupPayload({ expenses: [], people: [], settings: { currencyCode: 'PKR' } })).toBe(false);
    expect(isValidBackupPayload({ expenses: [], people: [] })).toBe(false);
  });
});
