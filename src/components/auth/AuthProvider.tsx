import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Update user's online status when session is loaded
      if (session?.user) {
        supabase
          .from("users")
          .update({ is_online: true, last_active: new Date().toISOString() })
          .eq("id", session.user.id)
          .then(({ error }) => {
            if (error) console.error("Error updating online status:", error);
          });
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Update user's online status when auth state changes
      if (session?.user) {
        supabase
          .from("users")
          .update({ is_online: true, last_active: new Date().toISOString() })
          .eq("id", session.user.id)
          .then(({ error }) => {
            if (error) console.error("Error updating online status:", error);
          });
      }

      setLoading(false);
    });

    // Set up window beforeunload event to update online status when user closes the browser
    const handleBeforeUnload = () => {
      if (user) {
        // Use navigator.sendBeacon for more reliable delivery during page unload
        const data = new FormData();
        data.append("id", user.id);
        data.append("is_online", "false");
        data.append("last_active", new Date().toISOString());

        // This is a synchronous API that works during page unload
        navigator.sendBeacon(
          `${supabase.supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
          data,
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing in:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing up:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update user's online status before signing out
      if (user) {
        await supabase
          .from("users")
          .update({ is_online: false, last_active: new Date().toISOString() })
          .eq("id", user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing out:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
