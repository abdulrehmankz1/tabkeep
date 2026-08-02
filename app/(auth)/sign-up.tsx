import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '../../src/components/Wordmark';
import { haptics } from '../../src/lib/haptics';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { useDialogStore } from '../../src/store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const signUp = useAppFlowStore((s) => s.signUp);
  const signInWithGoogle = useAppFlowStore((s) => s.signInWithGoogle);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const busy = submitting || googleSubmitting;

  async function handleSignUp() {
    if (busy || !email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    const { error: signUpError, needsEmailConfirmation } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    haptics.success();
    if (needsEmailConfirmation) {
      useDialogStore.getState().show({
        title: 'Check your email',
        message: `We sent a confirmation link to ${email.trim()}. Confirm it, then sign in.`,
        confirmText: 'Got it',
        onConfirm: () => router.replace('/sign-in'),
      });
    }
  }

  async function handleGoogleSignIn() {
    if (busy) return;
    setGoogleSubmitting(true);
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    setGoogleSubmitting(false);
    if (googleError) {
      setError(googleError);
      return;
    }
    haptics.success();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Wordmark size={30} />
        </View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Your data, synced everywhere.</Text>

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
          style={[styles.primaryButton, (busy || !email.trim() || !password) && styles.primaryButtonDisabled]}
          onPress={handleSignUp}
          disabled={busy || !email.trim() || !password}
        >
          {submitting ? (
            <ActivityIndicator color={colors.bgPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, busy && styles.primaryButtonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={busy}
        >
          {googleSubmitting ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          )}
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Sign in</Text>
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
