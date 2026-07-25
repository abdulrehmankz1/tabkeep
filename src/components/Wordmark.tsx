import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, ThemeColors, useTheme } from '../theme';
import { TabKeepMark } from './icons';

interface WordmarkProps {
  size?: number;
}

export function Wordmark({ size = 26 }: WordmarkProps) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.32 }]}>
        <TabKeepMark size={size * 0.6} color="#FFFFFF" />
      </View>
      <Text style={styles.text}>TabKeep</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    badge: {
      backgroundColor: '#0A0A0A',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      fontFamily: 'Inter_700Bold',
    },
  });
