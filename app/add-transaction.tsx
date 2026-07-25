import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmountDisplay } from '../src/components/AmountDisplay';
import { DatePickerSheet } from '../src/components/DatePickerSheet';
import { NumericKeypad } from '../src/components/NumericKeypad';
import { TimePickerSheet } from '../src/components/TimePickerSheet';
import { applyKey, rawToPaisas } from '../src/lib/amountInput';
import { haptics } from '../src/lib/haptics';
import { usePeopleStore } from '../src/store/usePeopleStore';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString();
}

function formatDate(date: Date) {
  if (isToday(date)) return 'Today';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AddTransaction() {
  const { personId, direction, amount: prefillAmount } = useLocalSearchParams<{
    personId: string;
    direction: 'gave' | 'received';
    amount?: string;
  }>();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const person = usePeopleStore((s) => s.people.find((p) => p.id === personId));
  const addEntry = usePeopleStore((s) => s.addEntry);

  const [raw, setRaw] = useState(prefillAmount ? String(Number(prefillAmount) / 100) : '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const submittingRef = useRef(false);

  const isGave = direction === 'gave';
  const tintColor = isGave ? colors.moneyOut : colors.moneyIn;

  function handleKeyPress(key: string) {
    setRaw((prev) => applyKey(prev, key));
  }

  function handleSave() {
    if (!person || submittingRef.current) return;
    submittingRef.current = true;
    haptics.success();
    addEntry(person.id, {
      amount: rawToPaisas(raw),
      direction: isGave ? 'gave' : 'received',
      note: note || undefined,
      date: formatDate(date),
      time: formatTime(date),
    });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.overlayBackdrop} onPress={() => router.back()} />
      <View style={[styles.sheet, { maxHeight: windowHeight * 0.9 }]}>
        <View style={styles.handle} />
        <View style={[styles.content, { paddingBottom: spacing.lg + insets.bottom }]}>
          <Text style={[styles.directionLabel, { color: tintColor }]}>
            {isGave ? 'You gave' : 'You got'} &middot; {person?.name ?? ''}
          </Text>
          <AmountDisplay paisas={rawToPaisas(raw)} />

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What for? (optional)"
            placeholderTextColor={colors.textSecondary}
            style={styles.noteInput}
          />

          <View style={styles.dateTimeRow}>
            <Pressable style={[styles.row, styles.dateTimeCell]} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{formatDate(date)}</Text>
            </Pressable>
            <Pressable style={[styles.row, styles.dateTimeCell]} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>{formatTime(date)}</Text>
            </Pressable>
          </View>

          <DatePickerSheet
            visible={showDatePicker}
            date={date}
            onSelect={setDate}
            onClose={() => setShowDatePicker(false)}
          />
          <TimePickerSheet
            visible={showTimePicker}
            date={date}
            onSelect={setDate}
            onClose={() => setShowTimePicker(false)}
          />

          <NumericKeypad onKeyPress={handleKeyPress} />

          <Pressable
            style={[styles.saveButton, { borderColor: tintColor }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: tintColor }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    directionLabel: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      textAlign: 'center',
    },
    noteInput: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
      padding: spacing.sm + 3,
      color: colors.textPrimary,
      fontSize: 14,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 3,
      paddingHorizontal: spacing.sm + 3,
    },
    dateTimeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    dateTimeCell: {
      flex: 1,
    },
    rowLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    rowValue: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    saveButton: {
      borderWidth: 1,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 7,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    saveButtonText: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
    },
  });
