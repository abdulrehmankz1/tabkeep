import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDialogStore } from '../store/useDialogStore';
import { darkColors, radius, spacing } from '../theme';

export function ConfirmDialog() {
  const { visible, title, message, confirmText, destructive, onConfirm, hide } = useDialogStore();

  function handleConfirm() {
    hide();
    onConfirm();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackdrop} onPress={hide} />
        <View style={styles.card}>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: darkColors.bgElevated,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.xs,
  },
  message: {
    color: darkColors.textSecondary,
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
    color: darkColors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  confirmButton: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 3,
    borderRadius: radius.button,
    backgroundColor: darkColors.bgSurface,
  },
  confirmButtonDestructive: {
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
    color: darkColors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  confirmButtonTextDestructive: {
    color: darkColors.moneyOut,
  },
});
