import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { avatarColorFromName, initialsFromName } from '../src/lib/avatarColor';
import { BIN_RETENTION_DAYS, daysLeftInBin } from '../src/lib/bin';
import { haptics } from '../src/lib/haptics';
import { formatAmount } from '../src/lib/money';
import { confirmPermanentDelete, useExpensesStore } from '../src/store/useExpensesStore';
import { confirmPermanentDeletePerson, usePeopleStore } from '../src/store/usePeopleStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

export default function Bin() {
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const allExpenses = useExpensesStore((s) => s.expenses);
  const binnedExpenses = useMemo(() => allExpenses.filter((e) => e.deletedAt), [allExpenses]);
  const restoreExpense = useExpensesStore((s) => s.restoreExpense);
  const purgeExpiredExpenses = useExpensesStore((s) => s.purgeExpiredBinItems);

  const allPeople = usePeopleStore((s) => s.people);
  const binnedPeople = useMemo(() => allPeople.filter((p) => p.deletedAt), [allPeople]);
  const restorePerson = usePeopleStore((s) => s.restorePerson);
  const purgeExpiredPeople = usePeopleStore((s) => s.purgeExpiredBinItems);

  useEffect(() => {
    purgeExpiredExpenses();
    purgeExpiredPeople();
  }, [purgeExpiredExpenses, purgeExpiredPeople]);

  const isEmpty = binnedExpenses.length === 0 && binnedPeople.length === 0;

  function handleRestoreExpense(id: string) {
    haptics.success();
    restoreExpense(id);
  }

  function handleRestorePerson(id: string) {
    haptics.success();
    restorePerson(id);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Bin</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.subtitle}>
        Items are permanently deleted {BIN_RETENTION_DAYS} days after being moved here.
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {isEmpty && (
          <View style={styles.emptyWrap}>
            <Icon name="trash" size={26} color={colors.textSecondary} />
            <Text style={styles.empty}>Bin is empty.</Text>
          </View>
        )}

        {binnedExpenses.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Expenses</Text>
            {binnedExpenses.map((item, index) => (
              <View key={item.id} style={[styles.row, index === 0 && styles.rowFirst]}>
                <View style={[styles.rowIconWrap, { backgroundColor: item.color }]}>
                  <Icon name={item.icon} size={16} color="#FFFFFF" />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowNote}>{item.note}</Text>
                  <Text style={styles.rowDays}>{daysLeftInBin(item.deletedAt!)} days left</Text>
                </View>
                <Text style={styles.rowAmount}>{formatAmount(item.amount)}</Text>
                <View style={styles.actions}>
                  <Pressable style={styles.actionButton} onPress={() => handleRestoreExpense(item.id)}>
                    <Text style={styles.restoreText}>Restore</Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => confirmPermanentDelete(item.id, item.note)}
                  >
                    <Icon name="trash" size={15} color={colors.moneyOut} />
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {binnedPeople.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>People</Text>
            {binnedPeople.map((item, index) => (
              <View key={item.id} style={[styles.row, index === 0 && styles.rowFirst]}>
                <View style={[styles.rowIconWrap, { backgroundColor: avatarColorFromName(item.name) }]}>
                  <Text style={styles.avatarText}>{initialsFromName(item.name)}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowNote}>{item.name}</Text>
                  <Text style={styles.rowDays}>{daysLeftInBin(item.deletedAt!)} days left</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.actionButton} onPress={() => handleRestorePerson(item.id)}>
                    <Text style={styles.restoreText}>Restore</Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => confirmPermanentDeletePerson(item.id, item.name)}
                  >
                    <Icon name="trash" size={15} color={colors.moneyOut} />
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
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
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12.5,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      lineHeight: 18,
    },
    list: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    sectionHeader: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowFirst: {
      borderTopWidth: 0,
    },
    rowIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
    },
    rowText: {
      flex: 1,
      minWidth: 120,
    },
    rowNote: {
      color: colors.textPrimary,
      fontSize: 15,
    },
    rowDays: {
      color: colors.warning,
      fontSize: 12,
    },
    rowAmount: {
      color: colors.textSecondary,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      fontVariant: ['tabular-nums'],
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      width: '100%',
      justifyContent: 'flex-end',
    },
    actionButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    restoreText: {
      color: colors.textPrimary,
      fontSize: 12.5,
      fontFamily: 'Inter_500Medium',
    },
    emptyWrap: {
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    empty: {
      color: colors.textSecondary,
      fontSize: 13,
    },
  });
