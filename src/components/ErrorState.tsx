import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, ThemeColors, useTheme } from '../theme';
import { Icon } from './icons';

interface ErrorStateProps {
  title?: string;
  body: string;
  onRetry: () => void;
}

export function ErrorState({ title = 'Something went wrong', body, onRetry }: ErrorStateProps) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon name="warntri" size={26} color={colors.moneyOut} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable style={styles.retry} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl + spacing.lg,
      gap: spacing.sm + 2,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
      backgroundColor: colors.bgSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    body: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
    },
    retry: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 3,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
    retryText: {
      color: colors.textPrimary,
      fontSize: 14.5,
      fontFamily: 'Inter_600SemiBold',
    },
  });
