import { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { usePulse } from '../lib/usePulse';
import { radius, spacing, ThemeColors, useTheme } from '../theme';

export function ReportsLoadingSkeleton() {
  const opacity = usePulse();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bar, { width: 100, height: 24, opacity, marginBottom: spacing.md }]} />

      <Animated.View style={[styles.pill, { opacity, marginBottom: spacing.md }]} />

      <View style={styles.row}>
        <Animated.View style={[styles.card, { opacity }]} />
        <Animated.View style={[styles.card, { opacity }]} />
      </View>

      <Animated.View style={[styles.bigCard, { opacity }]} />

      <View style={styles.udhaarCard}>
        <Animated.View style={[styles.bar, { width: 60, height: 15, opacity, marginBottom: spacing.md }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.bar, { flex: 1, height: 30, opacity }]} />
          <Animated.View style={[styles.bar, { flex: 1, height: 30, opacity }]} />
          <Animated.View style={[styles.bar, { flex: 1, height: 30, opacity }]} />
        </View>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.listRow}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <Animated.View style={[styles.bar, { flex: 1, height: 15, opacity }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      padding: spacing.md,
      paddingTop: spacing.lg,
    },
    pill: {
      width: 220,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.bgSurface,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    card: {
      flex: 1,
      height: 76,
      borderRadius: radius.card,
      backgroundColor: colors.bgSurface,
      marginBottom: spacing.md,
    },
    bigCard: {
      height: 60,
      borderRadius: radius.card,
      backgroundColor: colors.bgSurface,
      marginBottom: spacing.md,
    },
    udhaarCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    bar: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
    },
  });
