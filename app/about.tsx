import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '../src/components/icons';
import { Wordmark } from '../src/components/Wordmark';
import { haptics } from '../src/lib/haptics';
import { radius, spacing, ThemeColors, useTheme } from '../src/theme';

const LINKEDIN_URL = 'https://www.linkedin.com/in/abdul-rehman-khanzada-661757237';
const EMAIL = 'khanzadaabdulrehman1@gmail.com';

type Tab = 'Owner' | 'App';
const TABS: { key: Tab; label: string }[] = [
  { key: 'Owner', label: 'About the owner' },
  { key: 'App', label: 'About the app' },
];

export default function About() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<Tab>('Owner');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevronleft" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => {
              haptics.select();
              setTab(t.key);
            }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View key={tab} entering={FadeIn.duration(180)}>
        {tab === 'Owner' ? (
          <View style={styles.devSection}>
            <View style={styles.ownerHeaderRow}>
              <View style={styles.photoRing}>
                <Image source={require('../assets/developer-photo.png')} style={styles.devPhoto} />
              </View>

              <View style={styles.ownerHeaderInfo}>
                <Text style={styles.devName}>Abdul Rehman</Text>
                <View style={styles.creatorBadge}>
                  <Icon name="check" size={12} color="#FFFFFF" />
                  <Text style={styles.creatorBadgeText}>Creator of TabKeep</Text>
                </View>
                <Text style={styles.devTagline}>Full-Stack Developer · 3+ Years Experience</Text>
              </View>
            </View>

            <Text style={styles.devBio}>
              I design and build TabKeep end-to-end — from the offline-first data layer to the
              on-device OCR pipeline. Over 3+ years I&apos;ve shipped real products for startups
              and founders using React, Next.js, Angular, and Node.js, with AI integrations,
              automations, and cross-platform mobile apps.
            </Text>

            <View style={styles.linkRow}>
              <Pressable style={styles.linkButton} onPress={() => Linking.openURL(LINKEDIN_URL)}>
                <Icon name="link" size={15} color={colors.textPrimary} />
                <Text style={styles.linkButtonText}>LinkedIn</Text>
              </Pressable>
              <Pressable style={styles.linkButton} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>
                <Icon name="mail" size={15} color={colors.textPrimary} />
                <Text style={styles.linkButtonText}>Email</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.appSection}>
            <Wordmark size={48} />
            <Text style={styles.version}>Version {version}</Text>
            <Text style={styles.body}>
              TabKeep is an offline-first expense tracker and personal khata (lending ledger),
              with on-device receipt scanning — no data leaves your phone unless you explicitly
              sync.
            </Text>
          </View>
        )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.bgSurface,
      borderRadius: radius.full,
      padding: 4,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      alignItems: 'center',
    },
    tabBtnActive: {
      backgroundColor: colors.bgElevated,
    },
    tabText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    tabTextActive: {
      color: colors.textPrimary,
      fontFamily: 'Inter_600SemiBold',
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    devSection: {
      paddingTop: spacing.sm,
    },
    ownerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    photoRing: {
      width: 84,
      height: 84,
      borderRadius: radius.full,
      borderWidth: 2.5,
      borderColor: colors.info,
      alignItems: 'center',
      justifyContent: 'center',
    },
    devPhoto: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
    },
    ownerHeaderInfo: {
      flex: 1,
      gap: 5,
    },
    devName: {
      color: colors.textPrimary,
      fontSize: 19,
      fontFamily: 'Inter_700Bold',
    },
    creatorBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 5,
      backgroundColor: colors.info,
      borderRadius: radius.full,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm + 2,
    },
    creatorBadgeText: {
      color: '#FFFFFF',
      fontSize: 11.5,
      fontFamily: 'Inter_600SemiBold',
    },
    devTagline: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontFamily: 'Inter_500Medium',
    },
    devBio: {
      color: colors.textSecondary,
      fontSize: 13.5,
      textAlign: 'left',
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    linkRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.full,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    linkButtonText: {
      color: colors.textPrimary,
      fontSize: 13.5,
      fontFamily: 'Inter_500Medium',
    },
    appSection: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.xxl,
      gap: spacing.sm + 2,
    },
    version: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    body: {
      color: colors.textSecondary,
      fontSize: 13.5,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: spacing.sm,
    },
  });
