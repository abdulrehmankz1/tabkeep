import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { CATEGORY_NAMES } from '../src/data/mockExpenses';
import { formatAmount } from '../src/lib/money';
import { safePush } from '../src/lib/navGuard';
import { confirmMoveToBin, useExpensesStore } from '../src/store/useExpensesStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

const MONTHS = ['June 2026', 'July 2026', 'August 2026'];

export default function History() {
  const allExpenses = useExpensesStore((s) => s.expenses);
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [monthIndex, setMonthIndex] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categoryListOpen, setCategoryListOpen] = useState(false);

  const sections = useMemo(() => {
    const expenses = allExpenses.filter((e) => !e.deletedAt);
    const filtered =
      activeCategory === 'All'
        ? expenses
        : expenses.filter((e) => e.category === activeCategory);

    const groups = new Map<string, typeof expenses>();
    for (const expense of filtered) {
      const list = groups.get(expense.dateGroup) ?? [];
      list.push(expense);
      groups.set(expense.dateGroup, list);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [activeCategory, allExpenses]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.monthRow}>
          <Pressable
            onPress={() => setMonthIndex((i) => Math.max(0, i - 1))}
            hitSlop={8}
          >
            <Icon name="chevronleft" size={18} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.monthLabel}>{MONTHS[monthIndex]}</Text>
          <Pressable
            onPress={() => setMonthIndex((i) => Math.min(MONTHS.length - 1, i + 1))}
            hitSlop={8}
          >
            <Icon name="chevronright" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.filterAnchor}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by category</Text>
          <Pressable
            style={styles.filterDropdown}
            onPress={() => setCategoryListOpen((open) => !open)}
          >
            <Text style={styles.filterDropdownText}>
              {activeCategory === 'All' ? 'All categories' : activeCategory}
            </Text>
            <View style={{ transform: [{ rotate: categoryListOpen ? '180deg' : '0deg' }] }}>
              <Icon name="chevrondown" size={14} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {categoryListOpen && (
          <View style={styles.categoryList}>
            {CATEGORY_NAMES.map((name) => (
              <Pressable
                key={name}
                style={styles.categoryListItem}
                onPress={() => {
                  setActiveCategory(name);
                  setCategoryListOpen(false);
                }}
              >
                <Text style={styles.categoryListText}>
                  {name === 'All' ? 'All categories' : name}
                </Text>
                {activeCategory === name && <Icon name="check" size={16} color={colors.textPrimary} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.row, index === 0 && styles.rowFirst]}
            onPress={() => safePush(`/expense/${item.id}`)}
            onLongPress={() => confirmMoveToBin(item.id, item.note)}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={16} color="#FFFFFF" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowNote}>{item.note}</Text>
              <Text style={styles.rowTime}>{item.time}</Text>
            </View>
            <Text style={styles.rowAmount}>{formatAmount(item.amount)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No expenses in this category.</Text>}
      />
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
      paddingVertical: spacing.sm + 2,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    monthLabel: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      minWidth: 120,
      textAlign: 'center',
    },
    filterAnchor: {
      position: 'relative',
      zIndex: 10,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    filterLabel: {
      color: colors.textSecondary,
      fontSize: 12.5,
    },
    filterDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterDropdownText: {
      color: colors.textPrimary,
      fontSize: 12.5,
    },
    categoryList: {
      position: 'absolute',
      top: '100%',
      right: spacing.md,
      width: 190,
      backgroundColor: colors.bgElevated,
      borderRadius: radius.card,
      overflow: 'hidden',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    categoryListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.sm + 3,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    categoryListText: {
      color: colors.textPrimary,
      fontSize: 14.5,
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
    rowText: {
      flex: 1,
    },
    rowNote: {
      color: colors.textPrimary,
      fontSize: 15,
    },
    rowTime: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    rowAmount: {
      color: colors.moneyOut,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      fontVariant: ['tabular-nums'],
    },
    empty: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });
