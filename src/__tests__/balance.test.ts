import { calculateBalance, isSettled } from '../lib/balance';

describe('calculateBalance', () => {
  it('is positive when gave exceeds received (they owe the user)', () => {
    const balance = calculateBalance([
      { amount: 500000, direction: 'gave' },
      { amount: 300000, direction: 'received' },
    ]);
    expect(balance).toBe(200000);
  });

  it('is negative when received exceeds gave (the user owes them)', () => {
    const balance = calculateBalance([
      { amount: 100000, direction: 'gave' },
      { amount: 400000, direction: 'received' },
    ]);
    expect(balance).toBe(-300000);
  });

  it('is zero with no entries', () => {
    expect(calculateBalance([])).toBe(0);
  });
});

describe('isSettled', () => {
  it('is true only at zero', () => {
    expect(isSettled(0)).toBe(true);
    expect(isSettled(1)).toBe(false);
    expect(isSettled(-1)).toBe(false);
  });
});
