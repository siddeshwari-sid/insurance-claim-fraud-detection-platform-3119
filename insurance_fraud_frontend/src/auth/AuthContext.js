import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides Supabase session and auth actions to the app. */
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
      } finally {
        if (mounted) setAuthReady(true);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => {
    return {
      session,
      user: session?.user ?? null,
      authReady,
      // PUBLIC_INTERFACE
      async signInWithPassword({ email, password }) {
        /** Email/password sign-in via Supabase. */
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      // PUBLIC_INTERFACE
      async signUp({ email, password }) {
        /** Email/password sign-up via Supabase. */
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // NOTE: set this env var to your deployed frontend URL.
            emailRedirectTo: process.env.REACT_APP_FRONTEND_URL || window.location.origin
          }
        });
        if (error) throw error;
      },
      // PUBLIC_INTERFACE
      async signOut() {
        /** Sign out current user. */
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    };
  }, [session, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
