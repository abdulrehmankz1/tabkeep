import { Tabs, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeIn, FadeInUp } from 'react-native-reanimated';
import { Icon, IconName } from '../../src/components/icons';
import { haptics } from '../../src/lib/haptics';
import { safePush } from '../../src/lib/navGuard';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

const OPTIONS: {
  route: '/add-expense' | '/scan-receipt';
  icon: IconName;
  label: string;
  description: string;
  badge?: string;
  tintKey: 'moneyIn' | 'info';
}[] = [
  {
    route: '/add-expense',
    icon: 'plus',
    label: 'Manual entry',
    description: 'Type expense details yourself',
    tintKey: 'moneyIn',
  },
  {
    route: '/scan-receipt',
    icon: 'camera',
    label: 'Scan receipt',
    description: 'Auto-fill using camera or gallery',
    badge: 'OCR',
    tintKey: 'info',
  },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isPeopleTab = pathname.startsWith('/people');
  const [expanded, setExpanded] = useState(false);
  const fabBottom = insets.bottom + 18;
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handleFabPress() {
    haptics.tap();
    if (isPeopleTab) {
      safePush('/add-person');
      return;
    }
    setExpanded((e) => !e);
  }

  function handleOption(route: '/scan-receipt' | '/add-expense') {
    haptics.select();
    setExpanded(false);
    safePush(route);
  }

  return (
    <View style={styles.root}>
      <Tabs
        screenListeners={{
          tabPress: () => haptics.select(),
        }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.bgSurface,
            borderTopColor: colors.border,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home" color={String(color)} size={size} /> }}
        />
        <Tabs.Screen
          name="people"
          options={{ title: 'People', tabBarIcon: ({ color, size }) => <Icon name="users" color={String(color)} size={size} /> }}
        />
        <Tabs.Screen
          name="add-placeholder"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => (
              <View style={styles.fabWrap} pointerEvents="box-none">
                <Pressable
                  style={({ pressed }) => [
                    styles.fab,
                    expanded && styles.fabHidden,
                    pressed && styles.fabPressed,
                  ]}
                  onPress={handleFabPress}
                >
                  <Icon name="plus" size={26} color={colors.bgPrimary} />
                </Pressable>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => e.preventDefault(),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <Icon name="chart" color={String(color)} size={size} /> }}
        />
        <Tabs.Screen
          name="account"
          options={{ title: 'Account', tabBarIcon: ({ color, size }) => <Icon name="user" color={String(color)} size={size} /> }}
        />
      </Tabs>

      {expanded && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={StyleSheet.absoluteFill} entering={FadeIn.duration(150)}>
            <Pressable style={styles.backdrop} onPress={() => setExpanded(false)} />
          </Animated.View>

          <Animated.View
            style={[styles.sheet, { bottom: 56 + insets.bottom }]}
            entering={FadeInUp.duration(200).easing(Easing.out(Easing.quad))}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add expense</Text>

            {OPTIONS.map((opt, index) => (
              <Pressable
                key={opt.route}
                style={[styles.optionCard, index === OPTIONS.length - 1 && styles.optionCardLast]}
                onPress={() => handleOption(opt.route)}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: colors[opt.tintKey] }]}>
                  <Icon name={opt.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.optionTextWrap}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>{opt.label}</Text>
                    {opt.badge && (
                      <View style={[styles.badge, { backgroundColor: colors[opt.tintKey] }]}>
                        <Text style={styles.badgeText}>{opt.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>{opt.description}</Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>

          <Animated.View
            style={[styles.overlayFabWrap, { bottom: fabBottom }]}
            pointerEvents="box-none"
            entering={FadeIn.duration(150)}
          >
            <Pressable style={styles.overlayFab} onPress={() => setExpanded(false)}>
              <Icon name="x" size={24} color={colors.bgPrimary} />
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.72)',
    },
    fabWrap: {
      flex: 1,
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 18,
      width: 60,
      height: 60,
      borderRadius: radius.full,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.bgPrimary,
    },
    fabHidden: {
      opacity: 0,
    },
    fabPressed: {
      transform: [{ scale: 0.92 }],
    },
    overlayFabWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    overlayFab: {
      width: 60,
      height: 60,
      borderRadius: radius.full,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.bgPrimary,
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: colors.bgSurface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.sm + 2,
    },
    sheetTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: spacing.md,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      backgroundColor: colors.bgElevated,
      borderRadius: radius.card,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCardLast: {
      marginBottom: 0,
    },
    optionIconWrap: {
      width: 48,
      height: 48,
      borderRadius: radius.button,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionTextWrap: {
      flex: 1,
      gap: 2,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: 15.5,
      fontFamily: 'Inter_600SemiBold',
    },
    badge: {
      paddingHorizontal: spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10.5,
      fontFamily: 'Inter_600SemiBold',
    },
    optionDescription: {
      color: colors.textSecondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
  });
