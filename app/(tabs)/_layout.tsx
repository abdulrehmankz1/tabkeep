import { Tabs, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, FadeIn, FadeInUp } from 'react-native-reanimated';
import { Icon } from '../../src/components/icons';
import { haptics } from '../../src/lib/haptics';
import { safePush } from '../../src/lib/navGuard';
import { radius, spacing, ThemeColors, useTheme } from '../../src/theme';

const OPTIONS = [
  { route: '/add-expense' as const, label: 'Add expense', icon: 'plus' as const },
  { route: '/scan-receipt' as const, label: 'Scan receipt', icon: 'camera' as const },
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

          <View style={[styles.speedDial, { bottom: fabBottom + 78 }]} pointerEvents="box-none">
            {OPTIONS.map((opt, index) => (
              <Animated.View
                key={opt.route}
                entering={FadeInUp.duration(160).delay(index * 30).easing(Easing.out(Easing.quad))}
              >
                <Pressable style={styles.pill} onPress={() => handleOption(opt.route)}>
                  <View style={styles.pillIconWrap}>
                    <Icon name={opt.icon} size={15} color={colors.textPrimary} />
                  </View>
                  <Text style={styles.pillText}>{opt.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>

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
    speedDial: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      gap: spacing.sm + 2,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      backgroundColor: colors.bgElevated,
      borderRadius: radius.full,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 4,
      paddingRight: spacing.md + 2,
      width: 190,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    pillIconWrap: {
      width: 30,
      height: 30,
      borderRadius: radius.full,
      backgroundColor: colors.bgPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
  });
