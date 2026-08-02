import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '../../src/components/Wordmark';
import { haptics } from '../../src/lib/haptics';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { useDialogStore } from '../../src/store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const updatePassword = useAppFlowStore((s) => s.updatePassword);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleUpdatePassword() {
    if (submitting || !password || !confirmPassword) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    haptics.success();
    useDialogStore.getState().show({
      title: 'Password updated',
      message: 'Your password has been changed.',
      confirmText: 'Continue',
      onConfirm: () => {},
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Wordmark size={30} />
        </View>
        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.subtitle}>Choose a new password for your account.</Text>

        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          placeholder="New password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError(null);
          }}
          placeholder="Confirm new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[
            styles.primaryButton,
            (submitting || !password || !confirmPassword) && styles.primaryButtonDisabled,
          ]}
          onPress={handleUpdatePassword}
          disabled={submitting || !password || !confirmPassword}
        >
          {submitting ? (
            <ActivityIndicator color={colors.bgPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Update password</Text>
          )}
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
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      gap: spacing.sm + 6,
    },
    brandRow: {
      marginBottom: spacing.lg,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 26,
      fontWeight: '700',
      fontFamily: 'Inter_700Bold',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: spacing.sm,
    },
    error: {
      color: colors.moneyOut,
      fontSize: 13,
    },
    input: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.button,
      padding: spacing.sm + 3,
      color: colors.textPrimary,
      fontSize: 15,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 7,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: colors.bgPrimary,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: 'Inter_600SemiBold',
    },
  });
