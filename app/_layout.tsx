import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../src/components/ConfirmDialog';
import { applyGlobalFont } from '../src/lib/applyGlobalFont';
import { useAppFlowStore } from '../src/store/useAppFlowStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isSignedIn = useAppFlowStore((s) => s.isSignedIn);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyGlobalFont();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="history" />
          <Stack.Screen name="report-detail" />
          <Stack.Screen name="bin" />
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
              contentStyle: { backgroundColor: '#0A0A0A' },
            }}
          />
          <Stack.Screen
            name="add-person"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: '#0A0A0A' },
            }}
          />
          <Stack.Screen
            name="add-transaction"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: '#0A0A0A' },
            }}
          />
        </Stack.Protected>
      </Stack>
      <ConfirmDialog />
    </SafeAreaProvider>
  );
}
