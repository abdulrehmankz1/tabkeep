// Pure keypad-input reducer, kept separate from UI so it's easy to unit test.

export function applyKey(raw: string, key: string): string {
  if (key === 'back') return raw.slice(0, -1);

  if (key === '.') {
    if (raw.includes('.')) return raw;
    return raw === '' ? '0.' : raw + '.';
  }

  const [, decimals] = raw.split('.');
  if (decimals && decimals.length >= 2) return raw;
  if (raw === '0') return key;
  return raw + key;
}

export function rawToPaisas(raw: string): number {
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}
