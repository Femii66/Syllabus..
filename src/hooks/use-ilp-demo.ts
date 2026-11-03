import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/session";
import { initialState, parseState, type DemoState } from "@/lib/ilp-demo";

const EVENT = "syllabus:ilp-demo";

/** Per-identity demo wallet in localStorage; guest is isolated from each signed-in user.
 * All mounted hooks stay in sync via a same-tab custom event and the cross-tab storage event. */
export function useIlpDemo() {
  const { user, ready } = useSession();
  const key = `syllabus.ilp-demo.v1.${user?.id ?? "guest"}`;
  const [state, setState] = useState<DemoState | null>(null);

  useEffect(() => {
    if (!ready) return;
    const load = () => {
      const saved = parseState(localStorage.getItem(key));
      const s = saved ?? initialState();
      if (!saved) localStorage.setItem(key, JSON.stringify(s));
      setState(s);
    };
    load();
    const onLocal = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) load();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) load();
    };
    window.addEventListener(EVENT, onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, [key, ready]);

  const commit = useCallback(
    (next: DemoState) => {
      localStorage.setItem(key, JSON.stringify(next));
      setState(next);
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    },
    [key],
  );
  const reset = useCallback(() => commit(initialState()), [commit]);
  return { state, commit, reset, isGuest: !user };
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}