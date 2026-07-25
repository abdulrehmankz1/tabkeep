import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '../../src/components/icons';
import { Wordmark } from '../../src/components/Wordmark';
import { haptics } from '../../src/lib/haptics';
import { useAppFlowStore } from '../../src/store/useAppFlowStore';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

const SLIDES = [
  { icon: 'receipt' as const, title: 'Track every rupee', body: 'Log expenses in seconds and see exactly where your money goes.' },
  { icon: 'camera' as const, title: 'Scan receipts, skip typing', body: 'Point your camera at a receipt and let TabKeep fill in the details.' },
  { icon: 'lock' as const, title: 'Your data stays on your device', body: 'TabKeep works offline first. Nothing leaves your phone unless you choose to sync.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useAppFlowStore((s) => s.completeOnboarding);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLast = step === SLIDES.length - 1;

  function finish() {
    haptics.success();
    completeOnboarding();
    router.replace('/sign-up');
  }

  function handleNext() {
    haptics.select();
    if (isLast) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  }

  const { icon, title, body } = SLIDES[step];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Wordmark />
        <Pressable onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.View key={step} style={styles.content} entering={FadeIn.duration(220)}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={48} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={handleNext}>
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    skip: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Inter_600SemiBold',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: radius.full,
      backgroundColor: colors.bgSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 23,
      fontWeight: '700',
      fontFamily: 'Inter_700Bold',
      textAlign: 'center',
    },
    body: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs + 2,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 20,
      backgroundColor: colors.textPrimary,
    },
    cta: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 7,
      alignItems: 'center',
    },
    ctaText: {
      color: colors.bgPrimary,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: 'Inter_600SemiBold',
    },
  });
