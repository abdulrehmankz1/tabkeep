import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { Icon } from '../../src/components/icons';
import { ReportsLoadingSkeleton } from '../../src/components/ReportsLoadingSkeleton';
import { avatarColorFromName, initialsFromName } from '../../src/lib/avatarColor';
import { CATEGORY_META } from '../../src/lib/categoryMeta';
import { formatAmount } from '../../src/lib/money';
import { daysForAverage, isInMonth, monthName, monthYearLabel } from '../../src/lib/monthFilter';
import { safePush } from '../../src/lib/navGuard';
import { spendTrend } from '../../src/lib/trend';
import { useMockRefresh } from '../../src/lib/useMockRefresh';
import { useExpensesStore } from '../../src/store/useExpensesStore';
import { usePeopleStore } from '../../src/store/usePeopleStore';
import { darkColors, radius, spacing } from '../../src/theme';

type Status = 'loading' | 'success' | 'error';
type Tab = 'Overview' | 'Categories' | 'Trends';
const TABS: Tab[] = ['Overview', 'Categories', 'Trends'];

export default function Reports() {
  const allExpenses = useExpensesStore((s) => s.expenses);
  const allPeople = usePeopleStore((s) => s.people);
  const [status, setStatus] = useState<Status>('loading');
  const [tab, setTab] = useState<Tab>('Overview');
  const [monthOffset, setMonthOffset] = useState(0);
  const { refreshing, onRefresh } = useMockRefresh();

  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 500);
    return () => clearTimeout(timer);
  }, []);

  function retry() {
    setStatus('loading');
    setTimeout(() => setStatus('success'), 500);
  }

  const expenses = useMemo(() => allExpenses.filter((e) => !e.deletedAt), [allExpenses]);
  const people = useMemo(() => allPeople.filter((p) => !p.deletedAt), [allPeople]);
  const thisMonthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, monthOffset)),
    [expenses, monthOffset],
  );
  const lastMonthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, monthOffset + 1)),
    [expenses, monthOffset],
  );

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of thisMonthExpenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + Math.abs(e.amount));
    }
    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total, ...CATEGORY_META[name] }))
      .sort((a, b) => b.total - a.total);
  }, [thisMonthExpenses]);

  const monthTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const lastMonthTotal = useMemo(
    () => lastMonthExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0),
    [lastMonthExpenses],
  );
  const trend = spendTrend(monthTotal, lastMonthTotal, monthName(monthOffset + 1));
  const dailyAverage = Math.round(monthTotal / Math.max(1, daysForAverage(monthOffset)));

  const biggestExpense = useMemo(
    () => thisMonthExpenses.reduce<(typeof thisMonthExpenses)[number] | null>((max, e) => {
      if (!max || Math.abs(e.amount) > Math.abs(max.amount)) return e;
      return max;
    }, null),
    [thisMonthExpenses],
  );

  const dayTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of thisMonthExpenses) {
      totals.set(e.dateGroup, (totals.get(e.dateGroup) ?? 0) + Math.abs(e.amount));
    }
    return Array.from(totals.entries()).map(([label, total]) => ({ label, total }));
  }, [thisMonthExpenses]);
  const maxDayTotal = Math.max(1, ...dayTotals.map((d) => d.total));

  const peopleBalances = useMemo(
    () =>
      people.map((p) => ({
        ...p,
        balance: p.entries.reduce(
          (sum, e) => (e.direction === 'gave' ? sum + e.amount : sum - e.amount),
          0,
        ),
      })),
    [people],
  );
  const given = peopleBalances.reduce(
    (sum, p) => sum + p.entries.filter((e) => e.direction === 'gave').reduce((s, e) => s + e.amount, 0),
    0,
  );
  const received = peopleBalances.reduce(
    (sum, p) => sum + p.entries.filter((e) => e.direction === 'received').reduce((s, e) => s + e.amount, 0),
    0,
  );
  const outstanding = given - received;

  const isEmpty = expenses.length === 0 && given === 0 && received === 0;

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ReportsLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ErrorState
          body="We couldn't load your reports. Check your connection and try again."
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={darkColors.textSecondary} />}
      >
        <Text style={styles.title}>Reports</Text>

        <View style={styles.monthNav}>
          <Pressable onPress={() => setMonthOffset((o) => o + 1)} hitSlop={8}>
            <Icon name="chevronleft" size={18} color={darkColors.textPrimary} />
          </Pressable>
          <Text style={styles.monthNavLabel}>{monthYearLabel(monthOffset)}</Text>
          <Pressable onPress={() => setMonthOffset((o) => Math.max(0, o - 1))} hitSlop={8} disabled={monthOffset === 0}>
            <Icon name="chevronright" size={18} color={monthOffset === 0 ? darkColors.border : darkColors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {isEmpty ? (
          <EmptyState
            icon="chart"
            title="No reports yet"
            body="Add an expense or a khata entry to see your spending reports here."
            ctaLabel="Add expense"
            onPress={() => safePush('/add-expense')}
          />
        ) : tab === 'Overview' ? (
          <>
            <View style={styles.row}>
              <Pressable style={styles.card} onPress={() => safePush(`/report-detail?month=${monthOffset}`)}>
                <Text style={styles.label}>{monthOffset === 0 ? 'This month' : monthYearLabel(monthOffset)}</Text>
                <Text style={styles.amount}>{formatAmount(monthTotal)}</Text>
                {trend && (
                  <View style={[styles.trendPill, { borderColor: trend.good ? darkColors.moneyIn : darkColors.moneyOut }]}>
                    <Text style={[styles.trendPillText, { color: trend.good ? darkColors.moneyIn : darkColors.moneyOut }]}>
                      {trend.text}
                    </Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.card}>
                <Text style={styles.label}>Daily average</Text>
                <Text style={styles.amount}>{formatAmount(dailyAverage)}</Text>
              </View>
            </View>

            {biggestExpense && (
              <View style={styles.bigCard}>
                <View>
                  <Text style={styles.label}>Biggest expense</Text>
                  <Text style={styles.bigCardNote}>{biggestExpense.note}</Text>
                </View>
                <Text style={styles.bigCardAmount}>{formatAmount(Math.abs(biggestExpense.amount))}</Text>
              </View>
            )}

            <View style={styles.udhaarCard}>
              <Text style={styles.udhaarTitle}>Udhaar</Text>
              <View style={styles.row}>
                <View style={styles.udhaarStat}>
                  <Text style={styles.label}>Given</Text>
                  <Text style={[styles.smallAmount, { color: darkColors.moneyOut }]}>{formatAmount(given)}</Text>
                </View>
                <View style={styles.udhaarStat}>
                  <Text style={styles.label}>Received back</Text>
                  <Text style={[styles.smallAmount, { color: darkColors.moneyIn }]}>{formatAmount(received)}</Text>
                </View>
                <View style={styles.udhaarStat}>
                  <Text style={styles.label}>Outstanding</Text>
                  <Text style={styles.smallAmount}>{formatAmount(outstanding)}</Text>
                </View>
              </View>

              {peopleBalances.length > 0 && (
                <View style={styles.peopleList}>
                  {peopleBalances.map((p, index) => (
                    <Pressable
                      key={p.id}
                      style={[styles.personRow, index === 0 && styles.personRowFirst]}
                      onPress={() => safePush(`/person/${p.id}`)}
                    >
                      <View style={[styles.avatar, { backgroundColor: avatarColorFromName(p.name) }]}>
                        <Text style={styles.avatarText}>{initialsFromName(p.name)}</Text>
                      </View>
                      <Text style={styles.personName}>{p.name}</Text>
                      <Text
                        style={[
                          styles.personAmount,
                          { color: p.balance >= 0 ? darkColors.moneyIn : darkColors.moneyOut },
                        ]}
                      >
                        {formatAmount(Math.abs(p.balance))}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : tab === 'Categories' ? (
          <View style={styles.udhaarCard}>
            {categoryBreakdown.length === 0 ? (
              <Text style={styles.emptyText}>{monthOffset === 0 ? "No expenses yet." : `No expenses in ${monthYearLabel(monthOffset)}.`}</Text>
            ) : (
              categoryBreakdown.map((c, index) => (
                <View
                  key={c.name}
                  style={[styles.categoryRow, index === categoryBreakdown.length - 1 && styles.categoryRowLast]}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: c.color }]}>
                    <Icon name={c.icon} size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.categoryBody}>
                    <View style={styles.categoryHeaderRow}>
                      <Text style={styles.personName}>{c.name}</Text>
                      <Text style={styles.smallAmount}>-{formatAmount(c.total)}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(c.total / monthTotal) * 100}%`, backgroundColor: c.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.udhaarCard}>
            {dayTotals.length === 0 ? (
              <Text style={styles.emptyText}>{monthOffset === 0 ? "No expenses yet." : `No expenses in ${monthYearLabel(monthOffset)}.`}</Text>
            ) : (
              dayTotals.map((d, index) => (
                <View
                  key={d.label}
                  style={[styles.trendRow, index === dayTotals.length - 1 && styles.categoryRowLast]}
                >
                  <Text style={styles.trendLabel}>{d.label}</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${(d.total / maxDayTotal) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.trendAmount}>{formatAmount(d.total)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  monthNavLabel: {
    color: darkColors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 130,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: darkColors.bgElevated,
  },
  tabText: {
    color: darkColors.textSecondary,
    fontSize: 13.5,
  },
  tabTextActive: {
    color: darkColors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  label: {
    color: darkColors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  amount: {
    color: darkColors.textPrimary,
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  trendPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: spacing.xs,
  },
  trendPillText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  bigCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  bigCardNote: {
    color: darkColors.textPrimary,
    fontSize: 15,
    marginTop: 2,
  },
  bigCardAmount: {
    color: darkColors.textPrimary,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  udhaarCard: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  udhaarTitle: {
    color: darkColors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.sm,
  },
  udhaarStat: {
    flex: 1,
  },
  smallAmount: {
    color: darkColors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  peopleList: {
    marginTop: spacing.md,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: darkColors.border,
  },
  personRowFirst: {
    borderTopWidth: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
  personName: {
    flex: 1,
    color: darkColors.textPrimary,
    fontSize: 15,
  },
  personAmount: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryRowLast: {
    marginBottom: 0,
  },
  categoryBody: {
    flex: 1,
    gap: spacing.sm,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: darkColors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: darkColors.textPrimary,
  },
  trendRow: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  trendLabel: {
    color: darkColors.textPrimary,
    fontSize: 13.5,
  },
  trendAmount: {
    color: darkColors.textSecondary,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    color: darkColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
