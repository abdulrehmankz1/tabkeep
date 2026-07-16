import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, radius, spacing } from '../theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
}

export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  return (
    <View style={styles.grid}>
      {KEYS.map((key) => (
        <Pressable
          key={key}
          onPress={() => onKeyPress(key)}
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
        >
          <Text style={styles.keyText}>{key === 'back' ? '⌫' : key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  key: {
    width: '31%',
    height: 56,
    borderRadius: radius.button,
    backgroundColor: darkColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: darkColors.bgElevated,
  },
  keyText: {
    color: darkColors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
