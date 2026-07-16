import { Calendar, DateData } from 'react-native-calendars';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { darkColors, radius, spacing } from '../theme';

interface DatePickerSheetProps {
  visible: boolean;
  date: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePickerSheet({ visible, date, onSelect, onClose }: DatePickerSheetProps) {
  function handleDayPress(day: DateData) {
    onSelect(new Date(day.year, day.month - 1, day.day));
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Calendar
            current={toDateString(date)}
            initialDate={toDateString(date)}
            onDayPress={handleDayPress}
            markedDates={{ [toDateString(date)]: { selected: true } }}
            theme={{
              calendarBackground: darkColors.bgSurface,
              textSectionTitleColor: darkColors.textSecondary,
              dayTextColor: darkColors.textPrimary,
              textDisabledColor: darkColors.border,
              todayTextColor: darkColors.textPrimary,
              todayBackgroundColor: darkColors.bgElevated,
              selectedDayBackgroundColor: darkColors.accent,
              selectedDayTextColor: darkColors.bgPrimary,
              monthTextColor: darkColors.textPrimary,
              arrowColor: darkColors.textPrimary,
              textDayFontFamily: 'Inter_400Regular',
              textMonthFontFamily: 'Inter_600SemiBold',
              textDayHeaderFontFamily: 'Inter_500Medium',
              textDayFontSize: 14,
              textMonthFontSize: 15,
              textDayHeaderFontSize: 11,
            }}
            style={styles.calendar}
          />
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
  calendar: {
    borderRadius: radius.card,
    paddingBottom: spacing.sm,
  },
});
