import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { browserAuthConfigError } from "@/lib/auth-errors";
export const configError = () =>
  browserAuthConfigError(
    import.meta.env["VITE_SUPABASE_URL"],
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
  );
const SessionContext = createContext<{
  user: User | null;
  ready: boolean;
  signOut: () => Promise<void>;
}>({ user: null, ready: false, signOut: async () => {} });
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const query = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (configError()) {
      setReady(true);
      return;
    }
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) {
          setUser(data.user);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
      setReady(true);
      void router.invalidate();
      if (event !== "SIGNED_OUT") void query.invalidateQueries();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [query, router]);
  async function signOut() {
    await query.cancelQueries();
    query.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await router.navigate({ to: "/auth", replace: true });
  }
  return (
    <SessionContext.Provider value={{ user, ready, signOut }}>{children}</SessionContext.Provider>
  );
}
export const useSession = () => useContext(SessionContext);