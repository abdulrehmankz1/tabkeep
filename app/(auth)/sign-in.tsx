import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '../../src/components/Wordmark';
import { haptics } from '../../src/lib/haptics';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { useDialogStore } from '../../src/store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const signIn = useAppFlowStore((s) => s.signIn);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleSignIn() {
    if (submitting || !email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    haptics.success();
  }

  function handleGoogleSignIn() {
    useDialogStore.getState().show({
      title: 'Continue with Google',
      message: 'Google sign-in is coming soon — use email and password for now.',
      confirmText: 'Got it',
      onConfirm: () => {},
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Wordmark size={30} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to keep tabs on every rupee.</Text>

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
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          onPress={() => {
            haptics.tap();
            router.push('/forgot-password');
          }}
          hitSlop={6}
        >
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, (submitting || !email.trim() || !password) && styles.primaryButtonDisabled]}
          onPress={handleSignIn}
          disabled={submitting || !email.trim() || !password}
        >
          {submitting ? (
            <ActivityIndicator color={colors.bgPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign in</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleGoogleSignIn}>
          <Text style={styles.secondaryButtonText}>Continue with Google</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here? </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
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
    forgotPassword: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Inter_600SemiBold',
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
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 6,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Inter_500Medium',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    footerLink: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Inter_600SemiBold',
    },
  });
