import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerSheet } from '../src/components/DatePickerSheet';
import { Icon } from '../src/components/icons';
import { CATEGORY_META } from '../src/lib/categoryMeta';
import { dateGroupFor, isoDateFor } from '../src/lib/dateGroup';
import { useExpensesStore } from '../src/store/useExpensesStore';
import { darkColors, radius, spacing } from '../src/theme';

const ALL_CATEGORIES = ['Food', 'Rent', 'Bills', 'Transport', 'Other'];

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReceiptReview() {
  const params = useLocalSearchParams<{
    amount: string;
    merchant: string;
    date: string;
    dateConfident: string;
    category: string;
    imageUri: string;
  }>();

  const parsedCategory = ALL_CATEGORIES.includes(params.category) ? params.category : 'Other';
  const suggestedCategories = useMemo(() => {
    const rest = ALL_CATEGORIES.filter((c) => c !== parsedCategory);
    return [parsedCategory, ...rest].slice(0, 3);
  }, [parsedCategory]);

  const [amountRaw, setAmountRaw] = useState(String(Number(params.amount) / 100 || ''));
  const [merchant, setMerchant] = useState(params.merchant || '');
  const [date, setDate] = useState(params.date ? new Date(params.date) : new Date());
  const [dateConfident, setDateConfident] = useState(params.dateConfident === '1');
  const [category, setCategory] = useState(parsedCategory);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const submittingRef = useRef(false);

  const addExpense = useExpensesStore((s) => s.addExpense);

  function handleSelectDate(picked: Date) {
    setDate(picked);
    setDateConfident(true);
  }

  function handleConfirm() {
    const paisas = Math.round(parseFloat(amountRaw) * 100);
    if (submittingRef.current || !paisas || Number.isNaN(paisas)) return;
    submittingRef.current = true;
    const meta = CATEGORY_META[category] ?? CATEGORY_META.Other;
    addExpense({
      note: merchant.trim() || category,
      time: formatTime(date),
      dateGroup: dateGroupFor(date),
      date: isoDateFor(date),
      amount: -Math.abs(paisas),
      color: meta.color,
      icon: meta.icon,
      category,
      source: 'ocr',
      receiptImage: params.imageUri,
    });
    router.dismissTo('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={darkColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Check the details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.amountCard}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>Rs.</Text>
            <TextInput
              value={amountRaw}
              onChangeText={setAmountRaw}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={darkColors.textSecondary}
              style={styles.amountInput}
            />
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.label}>Merchant</Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Merchant name"
            placeholderTextColor={darkColors.textSecondary}
            style={styles.fieldInput}
          />
        </View>

        <Pressable
          style={[styles.fieldCard, !dateConfident && styles.fieldCardWarn]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.label, !dateConfident && styles.labelWarn]}>
            Date{!dateConfident ? ' · please verify' : ''}
          </Text>
          <Text style={styles.fieldValue}>{formatDateLabel(date)}</Text>
        </Pressable>

        <DatePickerSheet
          visible={showDatePicker}
          date={date}
          onSelect={handleSelectDate}
          onClose={() => setShowDatePicker(false)}
        />

        <Text style={styles.sectionLabel}>Suggested category</Text>
        <View style={styles.chipRow}>
          {suggestedCategories.map((c) => {
            const meta = CATEGORY_META[c] ?? CATEGORY_META.Other;
            const active = category === c;
            return (
              <Pressable
                key={c}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <View style={[styles.chipIconWrap, { backgroundColor: meta.color }]}>
                  <Icon name={meta.icon} size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.chipText}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!params.imageUri && (
          <Pressable style={styles.photoRow} onPress={() => setShowPhoto(true)}>
            <View style={styles.photoIconWrap}>
              <Icon name="receipt" size={18} color={darkColors.textPrimary} />
            </View>
            <Text style={styles.photoText}>Tap to view receipt photo</Text>
          </Pressable>
        )}

        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm & save</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showPhoto} transparent animationType="fade" onRequestClose={() => setShowPhoto(false)}>
        <View style={styles.photoOverlay}>
          <Pressable style={styles.photoClose} onPress={() => setShowPhoto(false)} hitSlop={10}>
            <Icon name="x" size={22} color="#FFFFFF" />
          </Pressable>
          {!!params.imageUri && (
            <Image source={{ uri: params.imageUri }} style={styles.photoFull} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  amountCard: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  label: {
    color: darkColors.textSecondary,
    fontSize: 11.5,
    marginBottom: spacing.xs,
  },
  labelWarn: {
    color: darkColors.warning,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amountPrefix: {
    color: darkColors.textPrimary,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  amountInput: {
    color: darkColors.textPrimary,
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    minWidth: 60,
    padding: 0,
    fontVariant: ['tabular-nums'],
  },
  fieldCard: {
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.sm + 5,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fieldCardWarn: {
    borderColor: darkColors.warning,
  },
  fieldInput: {
    color: darkColors.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  fieldValue: {
    color: darkColors.textPrimary,
    fontSize: 15,
  },
  sectionLabel: {
    color: darkColors.textSecondary,
    fontSize: 12.5,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: darkColors.border,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 3,
  },
  chipActive: {
    borderColor: darkColors.textPrimary,
  },
  chipIconWrap: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: darkColors.textPrimary,
    fontSize: 13.5,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: darkColors.bgSurface,
    borderRadius: radius.card,
    padding: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  photoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.button,
    backgroundColor: darkColors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    color: darkColors.textSecondary,
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 7,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: darkColors.bgPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  photoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoClose: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  photoFull: {
    width: '100%',
    height: '80%',
  },
});
