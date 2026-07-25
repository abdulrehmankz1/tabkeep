import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { darkColors, lightColors, ThemeColors } from './colors';

export function useResolvedTheme(): 'dark' | 'light' {
  const preference = useSettingsStore((s) => s.themePreference);
  const systemScheme = useColorScheme();
  if (preference === 'system') return systemScheme === 'light' ? 'light' : 'dark';
  return preference;
}

export function useTheme(): ThemeColors {
  const resolved = useResolvedTheme();
  return resolved === 'light' ? lightColors : darkColors;
}
