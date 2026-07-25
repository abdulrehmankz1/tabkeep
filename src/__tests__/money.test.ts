import { formatAmount, toPaisas } from '../lib/money';

describe('formatAmount', () => {
  it('formats whole rupees without decimals', () => {
    expect(formatAmount(150000)).toBe('Rs. 1,500');
  });

  it('formats paisas as decimals', () => {
    expect(formatAmount(15050)).toBe('Rs. 150.50');
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatAmount(-50000)).toBe('-Rs. 500');
  });

  it('formats zero', () => {
    expect(formatAmount(0)).toBe('Rs. 0');
  });
});

describe('toPaisas', () => {
  it('converts rupees to integer paisas', () => {
    expect(toPaisas(150.5)).toBe(15050);
  });

  it('rounds fractional paisas', () => {
    expect(toPaisas(10.005)).toBe(1001);
  });
});
