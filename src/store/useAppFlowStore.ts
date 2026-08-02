import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AppFlowState {
  hasOnboarded: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  isSignedIn: boolean;
  authReady: boolean;
  completeOnboarding: () => void;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAppFlowStore = create<AppFlowState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      session: null,
      user: null,
      isSignedIn: false,
      authReady: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
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
