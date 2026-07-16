import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/icons';
import { formatAmount } from '../../src/lib/money';
import { confirmMoveToBin, useExpensesStore } from '../../src/store/useExpensesStore';
import { darkColors, radius, spacing } from '../../src/theme';

export default function ExpenseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expense = useExpensesStore((s) => s.expenses.find((e) => e.id === id));

  if (!expense) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronleft" size={22} color={darkColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Expense</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={styles.empty}>This expense no longer exists.</Text>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    confirmMoveToBin(expense!.id, expense!.note, () => router.back());
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronleft" size={22} color={darkColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Expense</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: expense.color }]}>
          <Icon name={expense.icon} size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
        <Text style={styles.note}>{expense.note}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Category</Text>
          <Text style={styles.rowValue}>{expense.category}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date</Text>
          <Text style={styles.rowValue}>{expense.dateGroup}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Time</Text>
          <Text style={styles.rowValue}>{expense.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Source</Text>
          <Text style={styles.rowValue}>Manual</Text>
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Icon name="trash" size={16} color={darkColors.moneyOut} />
        <Text style={styles.deleteButtonText}>Move to bin</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  card: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    margin: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  amount: {
    color: darkColors.moneyOut,
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  note: {
    color: darkColors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: darkColors.border,
    alignSelf: 'stretch',
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: spacing.xs + 2,
  },
  rowLabel: {
    color: darkColors.textSecondary,
    fontSize: 13.5,
  },
  rowValue: {
    color: darkColors.textPrimary,
    fontSize: 13.5,
    fontFamily: 'Inter_500Medium',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.sm + 3,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  deleteButtonText: {
    color: darkColors.moneyOut,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  empty: {
    color: darkColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
