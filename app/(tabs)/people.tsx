import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { Icon } from '../../src/components/icons';
import { LoadingSkeleton } from '../../src/components/LoadingSkeleton';
import { avatarColorFromName, initialsFromName } from '../../src/lib/avatarColor';
import { calculateBalance, isSettled } from '../../src/lib/balance';
import { formatAmount } from '../../src/lib/money';
import { safePush } from '../../src/lib/navGuard';
import { useMockRefresh } from '../../src/lib/useMockRefresh';
import { confirmMoveToBinPerson, usePeopleStore } from '../../src/store/usePeopleStore';
import { darkColors, radius, spacing } from '../../src/theme';

type Status = 'loading' | 'success' | 'error';

export default function People() {
  const allPeople = usePeopleStore((s) => s.people);
  const [query, setQuery] = useState('');
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

  const balances = useMemo(
    () =>
      allPeople
        .filter((p) => !p.deletedAt)
        .map((p) => ({ ...p, balance: calculateBalance(p.entries) })),
    [allPeople],
  );
  const youllReceive = useMemo(
    () => balances.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0),
    [balances],
  );
  const youllPay = useMemo(
    () => balances.filter((p) => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0),
    [balances],
  );
  const filtered = useMemo(
    () => balances.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [balances, query],
  );

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.list}>
          <Text style={styles.title}>People</Text>
          <LoadingSkeleton rows={5} rowHeight={58} />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <Text style={[styles.title, styles.list]}>People</Text>
        <ErrorState body="We couldn't load your people list." onRetry={retry} />
      </SafeAreaView>
    );
  }

  if (balances.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <Text style={[styles.title, styles.list]}>People</Text>
        <EmptyState
          icon="users"
          title="No one added yet"
          body="Add a person to start keeping a khata with them."
          ctaLabel="Add person"
          onPress={() => safePush('/add-person')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={darkColors.textSecondary}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.title}>People</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>You&apos;ll receive</Text>
                <Text style={[styles.summaryAmount, { color: darkColors.moneyIn }]}>
                  {formatAmount(youllReceive)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>You&apos;ll pay</Text>
                <Text style={[styles.summaryAmount, { color: darkColors.moneyOut }]}>
                  {formatAmount(youllPay)}
                </Text>
              </View>
            </View>
            <View style={styles.searchBar}>
              <Icon name="search" size={16} color={darkColors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search people"
                placeholderTextColor={darkColors.textSecondary}
                style={styles.searchInput}
              />
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.row, index === 0 && styles.rowFirst]}
            onPress={() => safePush(`/person/${item.id}`)}
            onLongPress={() => confirmMoveToBinPerson(item.id, item.name)}
          >
            <View style={[styles.avatar, { backgroundColor: avatarColorFromName(item.name) }]}>
              <Text style={styles.avatarText}>{initialsFromName(item.name)}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            {isSettled(item.balance) ? (
              <View style={styles.settledBadge}>
                <Icon name="check" size={12} color={darkColors.textSecondary} />
                <Text style={styles.settled}>Settled</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.balance,
                  { color: item.balance > 0 ? darkColors.moneyIn : darkColors.moneyOut },
                ]}
              >
                {formatAmount(Math.abs(item.balance))}
              </Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No people found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.sm,
  },
  summaryLabel: {
    color: darkColors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.button,
    paddingHorizontal: spacing.sm + 3,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: darkColors.textPrimary,
    fontSize: 14,
    paddingVertical: spacing.sm + 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: darkColors.border,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  name: {
    flex: 1,
    color: darkColors.textPrimary,
    fontSize: 15.5,
  },
  balance: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  settled: {
    color: darkColors.textSecondary,
    fontSize: 12,
  },
  empty: {
    color: darkColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
