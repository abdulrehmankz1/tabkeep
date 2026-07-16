import { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { darkColors, radius, spacing } from '../theme';

interface TimePickerSheetProps {
  visible: boolean;
  date: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function WheelColumn({
  data,
  selectedIndex,
  onChange,
}: {
  data: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const listRef = useRef<FlatList<string>>(null);

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * PADDING_ROWS }}
      initialScrollIndex={selectedIndex}
      getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        onChange(Math.max(0, Math.min(data.length - 1, index)));
      }}
      renderItem={({ item, index }) => {
        const selected = index === selectedIndex;
        return (
          <View style={styles.wheelItem}>
            <Text style={[styles.wheelText, selected && styles.wheelTextSelected]}>{item}</Text>
          </View>
        );
      }}
    />
  );
}

export function TimePickerSheet({ visible, date, onSelect, onClose }: TimePickerSheetProps) {
  const hour24 = date.getHours();
  const initialPeriod = hour24 >= 12 ? 1 : 0;
  const initialHour = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const [hourIndex, setHourIndex] = useState(HOURS.indexOf(String(initialHour)));
  const [minuteIndex, setMinuteIndex] = useState(date.getMinutes());
  const [periodIndex, setPeriodIndex] = useState(initialPeriod);

  function handleDone() {
    const hour12 = Number(HOURS[hourIndex]);
    const isPM = periodIndex === 1;
    const hour24Result = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
    const next = new Date(date);
    next.setHours(hour24Result, minuteIndex, 0, 0);
    onSelect(next);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select time</Text>

          <View style={styles.wheelRow}>
            <View style={styles.highlightBar} pointerEvents="none" />
            <WheelColumn data={HOURS} selectedIndex={hourIndex} onChange={setHourIndex} />
            <Text style={styles.colon}>:</Text>
            <WheelColumn data={MINUTES} selectedIndex={minuteIndex} onChange={setMinuteIndex} />
            <View style={styles.periodColumn}>
              <WheelColumn data={PERIODS} selectedIndex={periodIndex} onChange={setPeriodIndex} />
            </View>
          </View>

          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: darkColors.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: darkColors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  title: {
    color: darkColors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * PADDING_ROWS,
    height: ITEM_HEIGHT,
    borderRadius: radius.button,
    backgroundColor: darkColors.bgElevated,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    color: darkColors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  wheelTextSelected: {
    color: darkColors.textPrimary,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  colon: {
    color: darkColors.textPrimary,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginHorizontal: 2,
  },
  periodColumn: {
    marginLeft: spacing.sm,
  },
  doneButton: {
    backgroundColor: darkColors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 7,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  doneButtonText: {
    color: darkColors.bgPrimary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
