import { Link, useRouterState } from "@tanstack/react-router";
import {
  GraduationCap,
  House,
  Send,
  WalletCards,
  Settings,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { useSession } from "@/components/session";
export function Aurora() {
  return null;
}
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="$yllabus home">
      <span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-xl font-bold text-primary-foreground">
        $
      </span>
      <span className="font-display text-2xl font-bold">
        yllabus<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
const tabs = [
  { to: "/dashboard", label: "Home", icon: House },
  { to: "/campus", label: "Campus", icon: GraduationCap },
  { to: "/wallet", label: "Wallet", icon: WalletCards },
  { to: "/send", label: "Send", icon: Send },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
export function Stage({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const publicPage = path === "/" || path.startsWith("/auth");
  if (publicPage)
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 lg:px-12">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Guest demo <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </header>
        {children}
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <aside className="sidebar">
        <div className="px-6 py-8">
          <Logo />
        </div>
        <p className="px-6 pb-3 text-xs font-medium text-muted-foreground">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation" className="space-y-1 px-3">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="nav-item"
              activeProps={{ className: "nav-item active" }}
            >
              <t.icon className="size-5" />
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-6">
          <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            Simulated banking only
          </div>
          <div className="flex items-center gap-3 border-t pt-5">
            <span className="avatar">{user ? "ST" : "MK"}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user ? "Student account" : "Maya Kessler"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user ? "Signed in · demo funds" : "Guest demo"}
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">Workspace</span>
            <span className="hidden text-border sm:block">/</span>
            <span className="text-sm font-semibold">
              {tabs.find((t) => t.to === path)?.label ?? "Confirmation"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="demo-badge">Demo mode</span>
            <ThemeToggle />
            {!user && (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <span className="avatar hidden sm:grid">{user ? "ST" : "MK"}</span>
          </div>
        </header>
        <main className="content-area">
          {children}
          <footer className="page-footer">
            <span>© 2026 $yllabus</span>
            <span>Demo balances · No real money moves</span>
          </footer>
        </main>
      </div>
      <nav aria-label="Mobile navigation" className="mobile-nav">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="flex min-w-0 flex-col items-center gap-1 py-3 text-[10px] text-muted-foreground"
            activeProps={{
              className: "flex min-w-0 flex-col items-center gap-1 py-3 text-[10px] text-primary",
            }}
          >
            <t.icon className="size-5" />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`screen-panel ${className}`}>{children}</section>;
}
export function TabBar() {
  return null;
}
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}