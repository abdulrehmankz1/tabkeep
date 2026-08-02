import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { parseAuthTokensFromUrl } from '../lib/authDeepLink';
import { supabase } from '../lib/supabase';

interface AppFlowState {
  hasOnboarded: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  isSignedIn: boolean;
  authReady: boolean;
  passwordRecovery: boolean;
  completeOnboarding: () => void;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  beginPasswordRecovery: (accessToken: string, refreshToken: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

export const useAppFlowStore = create<AppFlowState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      session: null,
      user: null,
      isSignedIn: false,
      authReady: false,
      passwordRecovery: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signInWithGoogle: async () => {
        const redirectUrl = Linking.createURL('/');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
        });
        if (error || !data.url) return { error: error?.message ?? 'Could not start Google sign-in.' };

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type !== 'success') {
          return { error: result.type === 'cancel' || result.type === 'dismiss' ? null : 'Google sign-in failed.' };
        }

        const tokens = parseAuthTokensFromUrl(result.url);
        if (!tokens) return { error: 'Google sign-in failed.' };

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        return { error: sessionError?.message ?? null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        set({ passwordRecovery: false });
      },
      sendPasswordResetEmail: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: Linking.createURL('reset-password'),
        });
        return { error: error?.message ?? null };
      },
      beginPasswordRecovery: async (accessToken, refreshToken) => {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) return { error: error.message };
        set({ passwordRecovery: true });
        return { error: null };
      },
      updatePassword: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        set({ passwordRecovery: false });
        return { error: null };
      },
    }),
    {
      name: 'tabkeep-app-flow',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasOnboarded: state.hasOnboarded }),
    },
  ),
);

// Session is the source of truth for auth state — restore it on boot and keep it
// in sync with sign-in/sign-out/token-refresh events for as long as the app runs.
supabase.auth.getSession().then(({ data: { session } }) => {
  useAppFlowStore.setState({ session, user: session?.user ?? null, isSignedIn: !!session, authReady: true });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAppFlowStore.setState({ session, user: session?.user ?? null, isSignedIn: !!session });
});
