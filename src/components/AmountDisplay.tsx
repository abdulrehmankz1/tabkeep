import { StyleSheet, Text } from 'react-native';
import { formatAmount } from '../lib/money';
import { darkColors } from '../theme';

interface AmountDisplayProps {
  paisas: number;
}

export function AmountDisplay({ paisas }: AmountDisplayProps) {
  return <Text style={styles.amount}>{formatAmount(paisas)}</Text>;
}

const styles = StyleSheet.create({
  amount: {
    color: darkColors.textPrimary,
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
