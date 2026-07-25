import { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { usePulse } from '../lib/usePulse';
import { radius, spacing, ThemeColors, useTheme } from '../theme';

export function HomeLoadingSkeleton() {
  const opacity = usePulse();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Animated.View style={[styles.bar, { width: 90, height: 16, opacity }]} />
        <Animated.View style={[styles.pill, { opacity }]} />
      </View>

      <View style={styles.donutCard}>
        <Animated.View style={[styles.circle, { opacity }]} />
        <View style={styles.legend}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Animated.View key={i} style={[styles.bar, styles.legendBar, { opacity }]} />
          ))}
        </View>
      </View>

      <Animated.View style={[styles.bar, { width: 100, height: 14, opacity, marginBottom: spacing.md }]} />

      <Animated.View style={[styles.bar, { width: 70, height: 17, opacity, marginBottom: spacing.sm }]} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <Animated.View style={[styles.avatar, { opacity }]} />
          <Animated.View style={[styles.bar, { flex: 1, height: 15, opacity }]} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      padding: spacing.md,
      paddingTop: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    pill: {
      width: 70,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: colors.bgSurface,
    },
    donutCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.card,
      padding: spacing.md,
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    circle: {
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: colors.bgElevated,
      marginBottom: spacing.md,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    legendBar: {
      width: '47%',
      height: 13,
    },
    bar: {
      backgroundColor: colors.bgSurface,
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
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.bgSurface,
    },
  });
