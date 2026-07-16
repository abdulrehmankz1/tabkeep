import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/icons';
import { avatarColorFromName, initialsFromName } from '../../src/lib/avatarColor';
import { calculateBalance, isSettled } from '../../src/lib/balance';
import { formatAmount } from '../../src/lib/money';
import { safePush } from '../../src/lib/navGuard';
import { confirmMoveToBinPerson, usePeopleStore } from '../../src/store/usePeopleStore';
import { darkColors, radius, spacing } from '../../src/theme';

export default function PersonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = usePeopleStore((s) => s.people.find((p) => p.id === id));
  const balance = useMemo(() => calculateBalance(person?.entries ?? []), [person]);

  if (!person) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronleft" size={22} color={darkColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Person</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={styles.empty}>This person no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const settled = isSettled(balance);
  const statement = settled
    ? 'All settled'
    : balance > 0
      ? `${person.name} owes you`
      : `You owe ${person.name}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronleft" size={22} color={darkColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{person.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <View style={[styles.avatar, { backgroundColor: avatarColorFromName(person.name) }]}>
            <Text style={styles.avatarText}>{initialsFromName(person.name)}</Text>
          </View>
          <Text style={styles.statement}>{statement}</Text>
          {!settled && (
            <Text
              style={[
                styles.balanceAmount,
                { color: balance > 0 ? darkColors.moneyIn : darkColors.moneyOut },
              ]}
            >
              {formatAmount(Math.abs(balance))}
            </Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => safePush(`/add-transaction?personId=${person.id}&direction=gave`)}
          >
            <Icon name="arrowout" size={16} color={darkColors.moneyOut} />
            <Text style={[styles.actionText, { color: darkColors.moneyOut }]}>You gave</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => safePush(`/add-transaction?personId=${person.id}&direction=received`)}
          >
            <Icon name="arrowin" size={16} color={darkColors.moneyIn} />
            <Text style={[styles.actionText, { color: darkColors.moneyIn }]}>You got</Text>
          </Pressable>
        </View>

        {!settled && (
          <Pressable
            style={styles.settleButton}
            onPress={() =>
              safePush(
                `/add-transaction?personId=${person.id}&direction=${balance > 0 ? 'received' : 'gave'}&amount=${Math.abs(balance)}`,
              )
            }
          >
            <Text style={styles.settleButtonText}>Settle up</Text>
          </Pressable>
        )}

        <Text style={styles.timelineTitle}>Timeline</Text>
        {person.entries.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          person.entries.map((entry, index) => (
            <View key={entry.id} style={[styles.timelineRow, index === 0 && styles.timelineRowFirst]}>
              <View style={styles.timelineIconWrap}>
                <Icon
                  name={entry.direction === 'gave' ? 'arrowout' : 'arrowin'}
                  size={15}
                  color={entry.direction === 'gave' ? darkColors.moneyOut : darkColors.moneyIn}
                />
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineLabel}>
                  {entry.direction === 'gave' ? 'You gave' : 'You got'}
                </Text>
                <Text style={styles.timelineDate}>
                  {entry.date}, {entry.time}
                </Text>
              </View>
              <Text
                style={[
                  styles.timelineAmount,
                  { color: entry.direction === 'gave' ? darkColors.moneyOut : darkColors.moneyIn },
                ]}
              >
                {formatAmount(entry.amount)}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={styles.deleteButton}
          onPress={() => confirmMoveToBinPerson(person.id, person.name, () => router.back())}
        >
          <Icon name="trash" size={16} color={darkColors.moneyOut} />
          <Text style={styles.deleteButtonText}>Move to bin</Text>
        </Pressable>
      </ScrollView>
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
  content: {
    padding: spacing.md,
  },
  balanceCard: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  statement: {
    color: darkColors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 3,
  },
  actionText: {
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
  settleButton: {
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 3,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  settleButtonText: {
    color: darkColors.textPrimary,
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
  timelineTitle: {
    color: darkColors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: darkColors.border,
  },
  timelineRowFirst: {
    borderTopWidth: 0,
  },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: darkColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: {
    flex: 1,
  },
  timelineLabel: {
    color: darkColors.textPrimary,
    fontSize: 14.5,
  },
  timelineDate: {
    color: darkColors.textSecondary,
    fontSize: 12,
  },
  timelineAmount: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  empty: {
    color: darkColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
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
});
