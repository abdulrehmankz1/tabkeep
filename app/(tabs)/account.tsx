import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../src/components/icons';
import { CURRENCIES } from '../../src/data/currencies';
import { exportExpensesCsv } from '../../src/lib/csvExport';
import { haptics } from '../../src/lib/haptics';
import { safePush } from '../../src/lib/navGuard';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { useDialogStore } from '../../src/store/useDialogStore';
import { useExpensesStore } from '../../src/store/useExpensesStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

interface SettingItem {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  route?: '/currency' | '/bin' | '/about' | '/theme' | '/backup';
  onPress?: () => void;
}

const THEME_LABELS = { dark: 'Dark', light: 'Light', system: 'System' } as const;

export default function Account() {
  const currencyCode = useSettingsStore((s) => s.currencyCode);
  const themePreference = useSettingsStore((s) => s.themePreference);
  const signOut = useAppFlowStore((s) => s.signOut);
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportExpensesCsv(expenses);
      haptics.success();
    } catch {
      useDialogStore.getState().show({
        title: 'Export failed',
        message: 'Something went wrong while creating the CSV file. Please try again.',
        confirmText: 'Got it',
        onConfirm: () => {},
      });
    } finally {
      setExporting(false);
    }
  }

  const SETTINGS: SettingItem[] = [
    { label: 'Currency', value: `${currency.symbol} (${currency.code})`, icon: 'currency', color: colors.moneyIn, route: '/currency' },
    { label: 'Theme', value: THEME_LABELS[themePreference], icon: 'theme', color: '#8B5CF6', route: '/theme' },
    { label: 'Sync & backup', value: '', icon: 'sync', color: colors.info, route: '/backup' },
    { label: 'Bin', value: '', icon: 'trash', color: colors.moneyOut, route: '/bin' },
    { label: 'Export CSV', value: exporting ? 'Exporting…' : '', icon: 'receipt', color: '#14B8A6', onPress: handleExportCsv },
    { label: 'About', value: '', icon: 'info', color: colors.textSecondary, route: '/about' },
  ];

  function handlePress(item: SettingItem) {
    haptics.tap();
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      safePush(item.route);
    }
  }

  function handleLogout() {
    useDialogStore.getState().show({
      title: 'Log out?',
      message: "You'll need to sign in again to access your data.",
      confirmText: 'Log out',
      destructive: true,
      onConfirm: signOut,
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Account</Text>

      {SETTINGS.map((item, index) => (
        <Pressable
          key={item.label}
          style={[styles.row, index === 0 && styles.rowFirst]}
          onPress={() => handlePress(item)}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.valueRow}>
            {!!item.value && <Text style={styles.value}>{item.value}</Text>}
            <Icon name="chevronright" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
      ))}

      <Pressable style={styles.row} onPress={handleLogout}>
        <View style={[styles.iconWrap, { backgroundColor: colors.moneyOut }]}>
          <Icon name="logout" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.logout}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
      padding: spacing.md,
      paddingTop: spacing.lg,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      paddingVertical: spacing.sm + 2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowFirst: {
      borderTopWidth: 0,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginLeft: 'auto',
    },
    label: {
      color: colors.textPrimary,
      fontSize: 15,
    },
    value: {
      color: colors.textSecondary,
      fontSize: 13.5,
    },
    logout: {
      color: colors.moneyOut,
      fontSize: 15,
    },
  });
