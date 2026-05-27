import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";

/* ─── State shape ───────────────────────────────────────────────────────── */

interface AuthState {
  user:      User    | null;
  session:   Session | null;
  isLoading: boolean;

  // Actions
  setUser:    (user: User | null)       => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean)        => void;
  reset:      ()                        => void;
}

/* ─── Store ─────────────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user:      null,
        session:   null,
        isLoading: true,

        setUser: (user) =>
          set({ user }, false, "auth/setUser"),

        setSession: (session) =>
          set(
            { session, user: session?.user ?? null },
            false,
            "auth/setSession"
          ),

        setLoading: (isLoading) =>
          set({ isLoading }, false, "auth/setLoading"),

        reset: () =>
          set(
            { user: null, session: null, isLoading: false },
            false,
            "auth/reset"
          ),
      }),
      {
        name: "leadflow-auth",
        // שמור רק user — session מתחדש ממילא מ-Supabase
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "AuthStore" }
  )
);
