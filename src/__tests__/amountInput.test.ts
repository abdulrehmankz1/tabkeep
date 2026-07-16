import { applyKey, rawToPaisas } from '../lib/amountInput';

describe('applyKey', () => {
  it('appends digits', () => {
    expect(applyKey('1', '5')).toBe('15');
  });

  it('replaces a lone leading zero instead of prefixing it', () => {
    expect(applyKey('0', '5')).toBe('5');
  });

  it('adds a decimal point', () => {
    expect(applyKey('12', '.')).toBe('12.');
  });

  it('starts with "0." when adding a decimal to an empty value', () => {
    expect(applyKey('', '.')).toBe('0.');
  });

  it('ignores a second decimal point', () => {
    expect(applyKey('12.5', '.')).toBe('12.5');
  });

  it('limits input to two decimal places', () => {
    expect(applyKey('12.50', '5')).toBe('12.50');
  });

  it('removes the last character on backspace', () => {
    expect(applyKey('125', 'back')).toBe('12');
  });
});

describe('rawToPaisas', () => {
  it('converts a typed amount to integer paisas', () => {
    expect(rawToPaisas('150.50')).toBe(15050);
  });

  it('treats an empty string as zero', () => {
    expect(rawToPaisas('')).toBe(0);
  });

  it('treats a lone decimal point as zero', () => {
    expect(rawToPaisas('.')).toBe(0);
  });
});
