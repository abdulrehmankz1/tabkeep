import { create } from 'zustand';
import { CURRENCIES, CurrencyOption } from '../data/currencies';

export type ThemePreference = 'dark' | 'light' | 'system';

interface SettingsState {
  currencyCode: string;
  setCurrency: (code: string) => void;
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currencyCode: 'PKR',
  setCurrency: (code) => set({ currencyCode: code }),
  themePreference: 'dark',
  setThemePreference: (theme) => set({ themePreference: theme }),
}));

export function getCurrentCurrency(): CurrencyOption {
  const code = useSettingsStore.getState().currencyCode;
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
