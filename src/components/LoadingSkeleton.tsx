import { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { usePulse } from '../lib/usePulse';
import { radius, spacing, ThemeColors, useTheme } from '../theme';

interface LoadingSkeletonProps {
  rows?: number;
  rowHeight?: number;
}

export function LoadingSkeleton({ rows = 5, rowHeight = 58 }: LoadingSkeletonProps) {
  const opacity = usePulse();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <Animated.View
          key={i}
          style={[styles.row, { height: rowHeight, opacity }]}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    row: {
      backgroundColor: colors.bgSurface,
      borderRadius: radius.card,
    },
  });
