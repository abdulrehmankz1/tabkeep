import { create } from 'zustand';

interface AppFlowState {
  hasOnboarded: boolean;
  isSignedIn: boolean;
  completeOnboarding: () => void;
  signIn: () => void;
  signOut: () => void;
}

// Temporary local UI state until real Supabase auth + persisted onboarding flag land in Phase 2.
export const useAppFlowStore = create<AppFlowState>((set) => ({
  hasOnboarded: false,
  isSignedIn: false,
  completeOnboarding: () => set({ hasOnboarded: true }),
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),
}));
