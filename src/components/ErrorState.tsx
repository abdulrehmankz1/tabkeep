import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, radius, spacing } from '../theme';
import { Icon } from './icons';

interface ErrorStateProps {
  title?: string;
  body: string;
  onRetry: () => void;
}

export function ErrorState({ title = 'Something went wrong', body, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon name="warntri" size={26} color={darkColors.moneyOut} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable style={styles.retry} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: darkColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    color: darkColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  retry: {
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 3,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  retryText: {
    color: darkColors.textPrimary,
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
});
