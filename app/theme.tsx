import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { haptics } from '../src/lib/haptics';
import { ThemePreference, useSettingsStore } from '../src/store/useSettingsStore';
import { spacing, ThemeColors, useTheme } from '../src/theme';

const OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: 'dark', label: 'Dark', description: 'Always use the dark theme' },
  { value: 'light', label: 'Light', description: 'Always use the light theme' },
  { value: 'system', label: 'System', description: "Match your phone's setting" },
];

export default function Theme() {
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Theme</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.note}>Changes how the app looks across every screen.</Text>

      <View style={styles.list}>
        {OPTIONS.map((opt, index) => (
          <Pressable
            key={opt.value}
            style={[styles.row, index === 0 && styles.rowFirst]}
            onPress={() => {
              haptics.select();
              setThemePreference(opt.value);
              router.back();
            }}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>{opt.label}</Text>
              <Text style={styles.code}>{opt.description}</Text>
            </View>
            {themePreference === opt.value && <Icon name="check" size={18} color={colors.textPrimary} />}
          </Pressable>
        ))}
      </View>
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
    note: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 18,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    list: {
      paddingHorizontal: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm + 6,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowFirst: {
      borderTopWidth: 0,
    },
    rowText: {
      gap: 2,
    },
    name: {
      color: colors.textPrimary,
      fontSize: 15,
    },
    code: {
      color: colors.textSecondary,
      fontSize: 12.5,
    },
  });
