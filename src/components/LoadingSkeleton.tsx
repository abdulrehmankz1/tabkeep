import { Animated, StyleSheet, View } from 'react-native';
import { usePulse } from '../lib/usePulse';
import { darkColors, radius, spacing } from '../theme';

interface LoadingSkeletonProps {
  rows?: number;
  rowHeight?: number;
}

export function LoadingSkeleton({ rows = 5, rowHeight = 58 }: LoadingSkeletonProps) {
  const opacity = usePulse();

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

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
  },
});
