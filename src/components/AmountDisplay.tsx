import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { formatAmount } from '../lib/money';
import { useSettingsStore } from '../store/useSettingsStore';
import { ThemeColors, useTheme } from '../theme';

interface AmountDisplayProps {
  paisas: number;
}

export function AmountDisplay({ paisas }: AmountDisplayProps) {
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <Text style={styles.amount}>{formatAmount(paisas)}</Text>;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    amount: {
      color: colors.textPrimary,
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
  });
