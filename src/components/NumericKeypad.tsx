import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { haptics } from '../lib/haptics';
import { radius, spacing, ThemeColors, useTheme } from '../theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handlePress(key: string) {
    haptics.tap();
    onKeyPress(key);
  }

  return (
    <View style={styles.grid}>
      {KEYS.map((key) => (
        <Pressable
          key={key}
          onPress={() => handlePress(key)}
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
        >
          <Text style={styles.keyText}>{key === 'back' ? '⌫' : key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    key: {
      width: '31%',
      height: 56,
      borderRadius: radius.button,
      backgroundColor: colors.bgSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyPressed: {
      backgroundColor: colors.bgElevated,
    },
    keyText: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '500',
      fontFamily: 'Inter_500Medium',
    },
  });
