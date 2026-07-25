import { createBackupPayload, isValidBackupPayload } from '../lib/backup';

describe('createBackupPayload', () => {
  it('captures expenses, people, and settings', () => {
    const payload = createBackupPayload();
    expect(payload.version).toBe(1);
    expect(Array.isArray(payload.expenses)).toBe(true);
    expect(Array.isArray(payload.people)).toBe(true);
    expect(payload.settings.currencyCode).toBe('PKR');
    expect(payload.settings.themePreference).toBe('dark');
    expect(typeof payload.createdAt).toBe('string');
  });
});

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
