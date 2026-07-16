import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/icons';
import { safePush } from '../../src/lib/navGuard';
import { darkColors, spacing } from '../../src/theme';

const SETTINGS = [
  { label: 'Currency', value: 'Rs. (PKR)' },
  { label: 'Theme', value: 'Dark' },
  { label: 'Sync & backup', value: '' },
  { label: 'Bin', value: '', route: '/bin' as const },
  { label: 'Export CSV', value: '' },
  { label: 'About', value: '' },
];

export default function Account() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Account</Text>

      {SETTINGS.map((item, index) => (
        <Pressable
          key={item.label}
          style={[styles.row, index === 0 && styles.rowFirst]}
          onPress={() => item.route && safePush(item.route)}
        >
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.valueRow}>
            {!!item.value && <Text style={styles.value}>{item.value}</Text>}
            {item.route && <Icon name="chevronright" size={16} color={darkColors.textSecondary} />}
          </View>
        </Pressable>
      ))}

      <View style={styles.row}>
        <Text style={styles.logout}>Logout</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 6,
    borderTopWidth: 1,
    borderTopColor: darkColors.border,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    color: darkColors.textPrimary,
    fontSize: 15,
  },
  value: {
    color: darkColors.textSecondary,
    fontSize: 13.5,
  },
  logout: {
    color: darkColors.moneyOut,
    fontSize: 15,
  },
});
