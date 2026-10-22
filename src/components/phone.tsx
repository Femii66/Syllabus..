import { Link } from "@tanstack/react-router";
import { GraduationCap, House, Moon, Send, Sun, WalletCards } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function Aurora() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-10 size-[380px] rounded-full bg-violet/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 size-[300px] rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-[320px] rounded-full bg-gold/25 blur-3xl" />
    </>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("syllabus-theme");
    const enabled = saved === "dark" || (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("syllabus-theme", next ? "dark" : "light");
    setDark(next);
  }
  return <button type="button" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"} className="absolute right-4 top-4 z-50 grid size-10 place-items-center rounded-full bg-paper/80 text-ink shadow-sm ring-1 ring-ink/10 backdrop-blur-sm">
    {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
  </button>;
}

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ice font-body text-ink">
      <Aurora />
      <ThemeToggle />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`screen-panel h-[720px] w-[355px] shrink-0 ${className}`}>{children}</div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-9 place-items-center rounded-xl bg-ink font-display text-lg font-bold leading-none text-paper">
        $
      </div>
      <span className="font-display text-lg font-bold tracking-tight">yllabus</span>
    </div>
  );
}

const tabs = [
  { to: "/dashboard", label: "Home", icon: House },
  { to: "/campus", label: "Campus", icon: GraduationCap },
  { to: "/wallet", label: "Wallet", icon: WalletCards },
  { to: "/send", label: "Send", icon: Send },
] as const;

export function TabBar() {
  return (
    <div className="glass mt-4 grid shrink-0 grid-cols-4 gap-1 rounded-2xl p-1 ring-1 ring-white/60">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-label={t.label}
            title={t.label}
            className="grid h-10 place-items-center rounded-xl text-ink/55 transition-colors"
            activeProps={{ className: "bg-ink text-paper" }}
          >
            <Icon className="size-4" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}
