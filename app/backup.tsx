import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { exportBackup, importBackup } from '../src/lib/backup';
import { haptics } from '../src/lib/haptics';
import { useDialogStore } from '../src/store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

export default function Backup() {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<Date | null>(null);

  function showError(message: string) {
    useDialogStore.getState().show({
      title: 'Something went wrong',
      message,
      confirmText: 'Got it',
      onConfirm: () => {},
    });
  }

  async function handleExport() {
    if (busy) return;
    setBusy('export');
    try {
      await exportBackup();
      haptics.success();
      setLastBackupAt(new Date());
    } catch {
      showError('Could not create a backup file. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handleImport() {
    if (busy) return;
    useDialogStore.getState().show({
      title: 'Restore from backup?',
      message: 'This replaces all expenses, khata entries, and settings currently on this device with the contents of the backup file.',
      confirmText: 'Choose file',
      destructive: true,
      onConfirm: () => runImport(),
    });
  }

  async function runImport() {
    setBusy('import');
    try {
      const result = await importBackup();
      if (result === 'restored') {
        useDialogStore.getState().show({
          title: 'Backup restored',
          message: 'Your data has been replaced with the contents of the backup file.',
          confirmText: 'Done',
          onConfirm: () => {},
        });
      }
    } catch {
      showError('That file could not be read as a TabKeep backup.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Sync & backup</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.note}>
        TabKeep is offline-first — your data stays on this device. Back up to a file you control
        (Drive, iCloud, email, wherever you like), and restore it any time.
      </Text>

      <View style={styles.list}>
        <Pressable style={[styles.row, styles.rowFirst]} onPress={handleExport} disabled={!!busy}>
          <View style={[styles.iconWrap, { backgroundColor: colors.info }]}>
            <Icon name="arrowout" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.name}>Back up now</Text>
            <Text style={styles.code}>
              {busy === 'export'
                ? 'Creating backup…'
                : lastBackupAt
                  ? `Last backup ${lastBackupAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                  : 'Save a copy of everything as a file'}
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.row} onPress={handleImport} disabled={!!busy}>
          <View style={[styles.iconWrap, { backgroundColor: colors.moneyOut }]}>
            <Icon name="arrowin" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.name}>Restore from backup</Text>
            <Text style={styles.code}>{busy === 'import' ? 'Restoring…' : 'Replace this device’s data from a file'}</Text>
          </View>
        </Pressable>
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
      gap: spacing.sm + 2,
      paddingVertical: spacing.sm + 6,
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
