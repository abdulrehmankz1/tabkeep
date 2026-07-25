import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { Icon } from '../src/components/icons';
import { CATEGORY_META } from '../src/lib/categoryMeta';
import { formatAmount } from '../src/lib/money';
import { isInMonth, monthName, monthYearLabel } from '../src/lib/monthFilter';
import { spendTrend } from '../src/lib/trend';
import { useExpensesStore } from '../src/store/useExpensesStore';
import { usePeopleStore } from '../src/store/usePeopleStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

export default function ReportDetail() {
  const { month } = useLocalSearchParams<{ month?: string }>();
  useSettingsStore((s) => s.currencyCode);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const monthOffset = Math.max(0, Number(month) || 0);
  const [offset, setOffset] = useState(monthOffset);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const allExpenses = useExpensesStore((s) => s.expenses);
  const allPeople = usePeopleStore((s) => s.people);

  const expenses = useMemo(() => allExpenses.filter((e) => !e.deletedAt), [allExpenses]);
  const people = useMemo(() => allPeople.filter((p) => !p.deletedAt), [allPeople]);
  const thisMonthExpenses = useMemo(() => expenses.filter((e) => isInMonth(e.date, offset)), [expenses, offset]);
  const lastMonthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, offset + 1)),
    [expenses, offset],
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
  const trend = spendTrend(monthTotal, lastMonthTotal, monthName(offset + 1));

  const biggestDay = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of thisMonthExpenses) {
      totals.set(e.dateGroup, (totals.get(e.dateGroup) ?? 0) + Math.abs(e.amount));
    }
    let best: { label: string; total: number } | null = null;
    for (const [label, total] of totals) {
      if (!best || total > best.total) best = { label, total };
    }
    return best;
  }, [thisMonthExpenses]);

  const outstanding = useMemo(() => {
    return people.reduce(
      (sum, p) =>
        sum +
        p.entries.reduce((s, e) => (e.direction === 'gave' ? s + e.amount : s - e.amount), 0),
      0,
    );
  }, [people]);

  async function handleShare() {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 0.95 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.monthNav}>
          <Pressable onPress={() => setOffset((o) => o + 1)} hitSlop={8}>
            <Icon name="chevronleft" size={16} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>{monthName(offset)} report</Text>
          <Pressable onPress={() => setOffset((o) => Math.max(0, o - 1))} hitSlop={8} disabled={offset === 0}>
            <Icon name="chevronright" size={16} color={offset === 0 ? colors.border : colors.textSecondary} />
          </Pressable>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View ref={cardRef} collapsable={false} style={styles.card}>
          <View style={styles.totalBlock}>
            <Text style={styles.monthLabel}>{monthYearLabel(offset)}</Text>
            <Text style={styles.total}>{formatAmount(monthTotal)}</Text>
            {trend && (
              <View style={[styles.trendPill, { borderColor: trend.good ? colors.moneyIn : colors.moneyOut }]}>
                <Text style={[styles.trendPillText, { color: trend.good ? colors.moneyIn : colors.moneyOut }]}>
                  {trend.text}
                </Text>
              </View>
            )}
          </View>

          {categoryBreakdown.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Top categories</Text>
              {categoryBreakdown.map((c) => (
                <View key={c.name} style={styles.categoryRow}>
                  <View style={styles.categoryHeaderRow}>
                    <Text style={styles.categoryName}>{c.name}</Text>
                    <Text style={styles.categoryAmount}>-{formatAmount(c.total)}</Text>
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
              ))}
            </>
          )}

          <View style={styles.divider} />

          {biggestDay && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Biggest spending day</Text>
              <Text style={styles.metaValue}>
                {biggestDay.label} · {formatAmount(biggestDay.total)}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Udhaar outstanding</Text>
            <Text style={styles.metaValue}>{formatAmount(outstanding)}</Text>
          </View>
        </View>

        <Pressable style={styles.shareButton} onPress={handleShare} disabled={sharing}>
          <Icon name="share" size={17} color={colors.bgPrimary} />
          <Text style={styles.shareText}>{sharing ? 'Preparing…' : 'Share as image'}</Text>
        </Pressable>
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
      paddingVertical: spacing.sm + 2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    totalBlock: {
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    monthLabel: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    total: {
      color: colors.textPrimary,
      fontSize: 30,
      fontFamily: 'Inter_700Bold',
      fontVariant: ['tabular-nums'],
    },
    trendPill: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    trendPillText: {
      fontSize: 11,
      fontFamily: 'Inter_500Medium',
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 12.5,
      marginBottom: spacing.sm,
    },
    categoryRow: {
      marginBottom: spacing.sm + 4,
      gap: spacing.xs,
    },
    categoryHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    categoryName: {
      color: colors.textPrimary,
      fontSize: 14.5,
    },
    categoryAmount: {
      color: colors.textPrimary,
      fontSize: 14.5,
      fontFamily: 'Inter_600SemiBold',
      fontVariant: ['tabular-nums'],
    },
    progressTrack: {
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs + 2,
    },
    metaLabel: {
      color: colors.textSecondary,
      fontSize: 13.5,
    },
    metaValue: {
      color: colors.textPrimary,
      fontSize: 13.5,
      fontFamily: 'Inter_600SemiBold',
      fontVariant: ['tabular-nums'],
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 6,
      marginTop: spacing.lg,
    },
    shareText: {
      color: colors.bgPrimary,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
    },
  });
