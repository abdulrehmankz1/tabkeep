import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { haptics } from '../lib/haptics';
import { useDialogStore } from '../store/useDialogStore';
import { radius, spacing, ThemeColors, useTheme } from '../theme';

export function ConfirmDialog() {
  const { visible, title, message, confirmText, destructive, onConfirm, hide } = useDialogStore();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handleConfirm() {
    haptics.tap();
    hide();
    onConfirm();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={hide}>
      <View style={styles.overlay}>
        <Animated.View
          style={StyleSheet.absoluteFill}
          entering={FadeIn.duration(140).easing(Easing.out(Easing.quad))}
        >
          <Pressable style={styles.overlayBackdrop} onPress={hide} />
        </Animated.View>
        <Animated.View
          style={styles.card}
          entering={FadeIn.duration(160).easing(Easing.out(Easing.quad))}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={hide}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, destructive && styles.confirmButtonDestructive]}
              onPress={handleConfirm}
            >
              <Text style={[styles.confirmButtonText, destructive && styles.confirmButtonTextDestructive]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    overlayBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    card: {
      width: '100%',
      backgroundColor: colors.bgElevated,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.xs,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    cancelButton: {
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 3,
      borderRadius: radius.button,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    confirmButton: {
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 3,
      borderRadius: radius.button,
      backgroundColor: colors.bgSurface,
    },
    confirmButtonDestructive: {
      backgroundColor: 'transparent',
    },
    confirmButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
    confirmButtonTextDestructive: {
      color: colors.moneyOut,
    },
  });
