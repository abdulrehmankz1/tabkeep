import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/icons';
import { haptics } from '../../src/lib/haptics';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { useDialogStore } from '../../src/store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const sendPasswordResetEmail = useAppFlowStore((s) => s.sendPasswordResetEmail);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleSendResetLink() {
    if (submitting || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: resetError } = await sendPasswordResetEmail(email.trim());
    setSubmitting(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    haptics.success();
    useDialogStore.getState().show({
      title: 'Check your email',
      message: `If an account exists for ${email.trim()}, we've sent a link to reset your password.`,
      confirmText: 'Done',
      onConfirm: () => router.back(),
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter the email you signed up with and we&apos;ll send you a link to reset your password.
        </Text>

        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.primaryButton, (submitting || !email.trim()) && styles.primaryButtonDisabled]}
          onPress={handleSendResetLink}
          disabled={submitting || !email.trim()}
        >
          {submitting ? (
            <ActivityIndicator color={colors.bgPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Send reset link</Text>
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
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      gap: spacing.sm + 6,
      marginTop: -spacing.xl,
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
      lineHeight: 20,
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
