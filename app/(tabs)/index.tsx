import { useEffect, useMemo, useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ErrorState } from '../../src/components/ErrorState';
import { HomeLoadingSkeleton } from '../../src/components/HomeLoadingSkeleton';
import { Icon } from '../../src/components/icons';
import { CATEGORY_META } from '../../src/lib/categoryMeta';
import { isInMonth } from '../../src/lib/monthFilter';
import { safePush } from '../../src/lib/navGuard';
import { formatAmount } from '../../src/lib/money';
import { useMockRefresh } from '../../src/lib/useMockRefresh';
import { confirmMoveToBin, useExpensesStore } from '../../src/store/useExpensesStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

type Status = 'loading' | 'success' | 'error';

export default function Home() {
  const allExpenses = useExpensesStore((s) => s.expenses);
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState<Status>('loading');
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
  const recent = useMemo(() => expenses.slice(0, 4), [expenses]);
  const thisMonthExpenses = useMemo(() => expenses.filter((e) => isInMonth(e.date)), [expenses]);

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
  const todayTotal = useMemo(
    () => expenses.filter((e) => e.dateGroup === 'Today').reduce((sum, e) => sum + Math.abs(e.amount), 0),
    [expenses],
  );
  const pieData = categoryBreakdown.map((c) => ({ value: c.total, color: c.color }));

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <HomeLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ErrorState
          body="We couldn't load your dashboard. Check your connection and try again."
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.monthLabel}>July 2026</Text>
              <View style={styles.offlinePill}>
                <View style={styles.offlineDot} />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            </View>

            <View style={styles.donutCard}>
              <View style={styles.donutWrap}>
                {monthTotal === 0 ? (
                  <View style={styles.emptyRing}>
                    <View style={styles.emptyRingHole}>
                      <Text style={styles.donutTotal}>{formatAmount(0)}</Text>
                      <Text style={styles.donutSubtitle}>spent in July</Text>
                    </View>
                  </View>
                ) : (
                  <PieChart
                    data={pieData}
                    donut
                    radius={85}
                    innerRadius={60}
                    innerCircleColor={colors.bgSurface}
                    centerLabelComponent={() => (
                      <View style={styles.donutCenter}>
                        <Text style={styles.donutTotal}>{formatAmount(monthTotal)}</Text>
                        <Text style={styles.donutSubtitle}>spent in July</Text>
                      </View>
                    )}
                  />
                )}
              </View>
              {categoryBreakdown.length > 0 && (
                <View style={styles.legend}>
                  {categoryBreakdown.map((c) => (
                    <View key={c.name} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                      <Text style={styles.legendName}>{c.name}</Text>
                      <Text style={styles.legendAmount}>{formatAmount(c.total)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.todayRow}>
              <Text style={styles.todayLabel}>Today</Text>
              <Text style={styles.todayAmount}>{formatAmount(todayTotal)}</Text>
            </View>

            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <Pressable onPress={() => safePush('/history')}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.duration(220).delay(Math.min(index, 6) * 40)}>
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
          </Animated.View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet — tap + to add one.</Text>}
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
    list: {
      padding: spacing.md,
      paddingTop: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    monthLabel: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    offlinePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: radius.full,
    },
    offlineDot: {
      width: 6,
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.warning,
    },
    offlineText: {
      color: colors.warning,
      fontSize: 11,
      fontFamily: 'Inter_500Medium',
    },
    donutCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.card,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    donutWrap: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    donutCenter: {
      alignItems: 'center',
    },
    emptyRing: {
      width: 170,
      height: 170,
      borderRadius: 85,
      borderWidth: 14,
      borderColor: colors.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyRingHole: {
      alignItems: 'center',
    },
    donutTotal: {
      color: colors.textPrimary,
      fontSize: 17,
      fontFamily: 'Inter_700Bold',
      fontVariant: ['tabular-nums'],
    },
    donutSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 1,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      width: '47%',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: radius.full,
    },
    legendName: {
      color: colors.textPrimary,
      fontSize: 13,
    },
    legendAmount: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontFamily: 'Inter_600SemiBold',
      marginLeft: 'auto',
      fontVariant: ['tabular-nums'],
    },
    todayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    todayLabel: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    todayAmount: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      fontVariant: ['tabular-nums'],
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 17,
      fontFamily: 'Inter_600SemiBold',
    },
    seeAll: {
      color: colors.info,
      fontSize: 12.5,
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
      marginTop: spacing.lg,
    },
  });
