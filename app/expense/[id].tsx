import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/icons';
import { formatAmount } from '../../src/lib/money';
import { confirmMoveToBin, useExpensesStore } from '../../src/store/useExpensesStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

export default function ExpenseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const expense = useExpensesStore((s) => s.expenses.find((e) => e.id === id));

  if (!expense) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronleft" size={22} color={colors.textPrimary} />
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
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
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
          <Text style={styles.rowValue}>{expense.source === 'ocr' ? 'Scanned receipt' : 'Manual'}</Text>
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Icon name="trash" size={16} color={colors.moneyOut} />
        <Text style={styles.deleteButtonText}>Move to bin</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    card: {
      backgroundColor: colors.bgSurface,
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
      color: colors.moneyOut,
      fontSize: 30,
      fontFamily: 'Inter_700Bold',
      fontVariant: ['tabular-nums'],
    },
    note: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
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
      color: colors.textSecondary,
      fontSize: 13.5,
    },
    rowValue: {
      color: colors.textPrimary,
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
      borderColor: colors.border,
    },
    deleteButtonText: {
      color: colors.moneyOut,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    empty: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });
