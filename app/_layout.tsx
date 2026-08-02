import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../src/components/ConfirmDialog';
import { seedIfEmpty } from '../src/db/seed';
import { applyGlobalFont } from '../src/lib/applyGlobalFont';
import { parseAuthTokensFromUrl } from '../src/lib/authDeepLink';
import { useAppFlowStore } from '../src/store/useAppFlowStore';
import { useExpensesStore } from '../src/store/useExpensesStore';
import { usePeopleStore } from '../src/store/usePeopleStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useResolvedTheme, useTheme } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function handleAuthDeepLink(url: string) {
  const tokens = parseAuthTokensFromUrl(url);
  if (!tokens || tokens.type !== 'recovery') return;
  useAppFlowStore.getState().beginPasswordRecovery(tokens.accessToken, tokens.refreshToken).then(({ error }) => {
    if (!error) router.replace('/reset-password');
  });
}

export default function RootLayout() {
  const isSignedIn = useAppFlowStore((s) => s.isSignedIn);
  const passwordRecovery = useAppFlowStore((s) => s.passwordRecovery);
  const colors = useTheme();
  const resolvedTheme = useResolvedTheme();
  const hydrateExpenses = useExpensesStore((s) => s.hydrate);
  const hydratePeople = usePeopleStore((s) => s.hydrate);
  const [dbReady, setDbReady] = useState(false);
  const [settingsReady, setSettingsReady] = useState(useSettingsStore.persist.hasHydrated());
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    seedIfEmpty()
      .then(() => Promise.all([hydrateExpenses(), hydratePeople()]))
      .finally(() => setDbReady(true));
  }, [hydrateExpenses, hydratePeople]);

  useEffect(() => {
    return useSettingsStore.persist.onFinishHydration(() => setSettingsReady(true));
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthDeepLink(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => handleAuthDeepLink(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady && settingsReady) {
      applyGlobalFont();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady, settingsReady]);

  if (!fontsLoaded || !dbReady || !settingsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isSignedIn || passwordRecovery}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={isSignedIn && !passwordRecovery}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="history" />
          <Stack.Screen name="report-detail" />
          <Stack.Screen name="bin" />
          <Stack.Screen name="currency" />
          <Stack.Screen name="theme" />
          <Stack.Screen name="about" />
          <Stack.Screen name="backup" />
          <Stack.Screen name="expense/[id]" />
          <Stack.Screen name="person/[id]" />
          <Stack.Screen
            name="scan-receipt"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="receipt-review" />
          <Stack.Screen
            name="add-expense"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.bgPrimary },
            }}
          />
          <Stack.Screen
            name="add-person"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.bgPrimary },
            }}
          />
          <Stack.Screen
            name="add-transaction"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.bgPrimary },
            }}
          />
        </Stack.Protected>
      </Stack>
      <ConfirmDialog />
    </SafeAreaProvider>
  );
}
