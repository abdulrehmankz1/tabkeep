import { Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, radius, spacing } from '../theme';
import { Icon, IconName } from './icons';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
}

export function EmptyState({ icon, title, body, ctaLabel, onPress }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={28} color={darkColors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable style={styles.cta} onPress={onPress}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
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
  cta: {
    backgroundColor: darkColors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 3,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  ctaText: {
    color: darkColors.bgPrimary,
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
});
