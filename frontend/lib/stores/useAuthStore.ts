import { create } from 'zustand';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const supabase = getSupabaseClient();

    const { data: { session } } = await supabase.auth.getSession();
    set({
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    });

    // 세션 상태 변경 리스너 (토큰 갱신 포함)
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      set({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
    set({ isLoading: false });
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 인증 코드를 /auth/callback으로 보내야 exchangeCodeForSession이 호출됨 (PKCE 플로우)
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
    set({ isLoading: false });
    // session이 null이면 이메일 인증 대기 상태
    return { needsEmailConfirmation: !data.session };
  },

  resendConfirmation: async (email: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
