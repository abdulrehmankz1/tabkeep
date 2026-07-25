import { Contact, ContactField } from 'expo-contacts';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/icons';
import { haptics } from '../src/lib/haptics';
import { usePeopleStore } from '../src/store/usePeopleStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

export default function AddPerson() {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const addPerson = usePeopleStore((s) => s.addPerson);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const submittingRef = useRef(false);

  async function handleImportFromContacts() {
    const picked = await Contact.presentPicker();
    if (!picked) return;
    const details = await picked.getDetails([ContactField.FULL_NAME, ContactField.PHONES]);
    if (details.fullName) setName(details.fullName);
    if (details.phones && details.phones.length > 0) {
      setPhone(details.phones[0].number ?? '');
    }
  }

  function handleSave() {
    if (!name.trim() || submittingRef.current) return;
    submittingRef.current = true;
    haptics.success();
    const id = addPerson(name.trim(), phone.trim() || undefined);
    router.replace(`/person/${id}`);
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.overlayBackdrop} onPress={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={[styles.content, { paddingBottom: spacing.lg + insets.bottom }]}>
            <Text style={styles.title}>Add person</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone (optional)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Pressable style={styles.importButton} onPress={handleImportFromContacts}>
              <Icon name="users" size={16} color={colors.textPrimary} />
              <Text style={styles.importButtonText}>Import from contacts</Text>
            </Pressable>

            <Pressable
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    overlayBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    keyboardAvoider: {
      flexShrink: 1,
      flexGrow: 0,
    },
    sheet: {
      backgroundColor: colors.bgSurface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    content: {
      padding: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.sm + 2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 17,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
      padding: spacing.sm + 3,
      color: colors.textPrimary,
      fontSize: 14,
    },
    importButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 3,
    },
    importButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 7,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: colors.bgPrimary,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
    },
  });
