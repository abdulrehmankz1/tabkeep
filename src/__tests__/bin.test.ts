import { BIN_RETENTION_DAYS, daysLeftInBin } from '../lib/bin';

describe('daysLeftInBin', () => {
  it('returns the full retention window right after deletion', () => {
    expect(daysLeftInBin(Date.now())).toBe(BIN_RETENTION_DAYS);
  });

  it('counts down as time passes', () => {
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
    expect(daysLeftInBin(tenDaysAgo)).toBe(BIN_RETENTION_DAYS - 10);
  });

  it('never goes below zero once the retention window has passed', () => {
    const longAgo = Date.now() - (BIN_RETENTION_DAYS + 30) * 24 * 60 * 60 * 1000;
    expect(daysLeftInBin(longAgo)).toBe(0);
  });
});
