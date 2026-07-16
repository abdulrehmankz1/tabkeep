import { Text, TextInput } from 'react-native';

// RN has no built-in "default app font" — this is the standard workaround for applying
// Inter everywhere without wrapping every Text/TextInput in the app.
export function applyGlobalFont() {
  const TextAny = Text as unknown as { defaultProps?: { style?: unknown } };
  const TextInputAny = TextInput as unknown as { defaultProps?: { style?: unknown } };

  TextAny.defaultProps = TextAny.defaultProps || {};
  TextAny.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextAny.defaultProps.style];

  TextInputAny.defaultProps = TextInputAny.defaultProps || {};
  TextInputAny.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextInputAny.defaultProps.style];
}
