import { router } from 'expo-router';
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
import { Icon } from '../src/components/icons';
import { NumericKeypad } from '../src/components/NumericKeypad';
import { TimePickerSheet } from '../src/components/TimePickerSheet';
import { applyKey, rawToPaisas } from '../src/lib/amountInput';
import { CATEGORY_META } from '../src/lib/categoryMeta';
import { dateGroupFor, isoDateFor } from '../src/lib/dateGroup';
import { haptics } from '../src/lib/haptics';
import { useExpensesStore } from '../src/store/useExpensesStore';
import { chipColors, radius, spacing, ThemeColors, useTheme } from '../src/theme';

const CATEGORIES = [
  { name: 'Food', icon: 'coffee' as const },
  { name: 'Rent', icon: 'building' as const },
  { name: 'Bills', icon: 'zap' as const },
  { name: 'Transport', icon: 'truck' as const },
  { name: 'Other', icon: 'zap' as const },
];

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

export default function AddExpense() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [raw, setRaw] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [note, setNote] = useState('');
  const [categoryListOpen, setCategoryListOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const submittingRef = useRef(false);
  const category = CATEGORIES[categoryIndex];
  const addExpense = useExpensesStore((s) => s.addExpense);

  function handleKeyPress(key: string) {
    setRaw((prev) => applyKey(prev, key));
  }

  function handleSave() {
    const amount = rawToPaisas(raw);
    if (submittingRef.current || amount === 0) return;
    submittingRef.current = true;
    haptics.success();
    addExpense({
      note: note.trim() || category.name,
      time: formatTime(date),
      dateGroup: dateGroupFor(date),
      date: isoDateFor(date),
      amount: -amount,
      color: CATEGORY_META[category.name]?.color ?? '#6B7280',
      icon: category.icon,
      category: category.name,
      source: 'manual',
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
          <AmountDisplay paisas={rawToPaisas(raw)} />

          <Pressable
            style={[styles.categoryRow, categoryListOpen && styles.categoryRowOpen]}
            onPress={() => setCategoryListOpen((open) => !open)}
          >
            <View style={[styles.categoryIconWrap, { backgroundColor: chipColors[categoryIndex % chipColors.length] }]}>
              <Icon name={category.icon} size={14} color="#FFFFFF" />
            </View>
            <View style={styles.categoryTextWrap}>
              <Text style={styles.categoryLabel}>Category</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <View style={{ transform: [{ rotate: categoryListOpen ? '180deg' : '0deg' }] }}>
              <Icon name="chevrondown" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>

          {categoryListOpen && (
            <View style={styles.categoryList}>
              {CATEGORIES.map((c, i) => (
                <Pressable
                  key={c.name}
                  style={[styles.categoryListItem, i === CATEGORIES.length - 1 && styles.categoryListItemLast]}
                  onPress={() => {
                    setCategoryIndex(i);
                    setCategoryListOpen(false);
                  }}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: chipColors[i % chipColors.length] }]}>
                    <Icon name={c.icon} size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryListText}>{c.name}</Text>
                  {i === categoryIndex && <Icon name="check" size={16} color={colors.textPrimary} />}
                </Pressable>
              ))}
            </View>
          )}

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

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.textSecondary}
            style={styles.noteInput}
          />

          <NumericKeypad onKeyPress={handleKeyPress} />

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
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
      paddingBottom: spacing.lg,
      gap: spacing.sm + 2,
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
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm + 3,
    },
    categoryRowOpen: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    categoryIconWrap: {
      width: 26,
      height: 26,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryTextWrap: {
      flex: 1,
    },
    categoryLabel: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    categoryName: {
      color: colors.textPrimary,
      fontSize: 14.5,
      fontFamily: 'Inter_500Medium',
    },
    categoryList: {
      backgroundColor: colors.bgElevated,
      borderBottomLeftRadius: radius.button,
      borderBottomRightRadius: radius.button,
      marginTop: -(spacing.sm + 2),
      overflow: 'hidden',
    },
    categoryListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm + 3,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    categoryListItemLast: {
      paddingBottom: spacing.sm + 3,
    },
    categoryListText: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14.5,
    },
    noteInput: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.button,
      padding: spacing.sm + 3,
      color: colors.textPrimary,
      fontSize: 14,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      paddingVertical: spacing.sm + 7,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    saveButtonText: {
      color: colors.bgPrimary,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
    },
  });
