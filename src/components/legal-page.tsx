import { Link } from "@tanstack/react-router";
import { Stage } from "@/components/phone";

export function LegalPage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Stage>
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:pt-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Student transparency · Demo</p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="glass space-y-7 rounded-2xl p-6 text-sm leading-7 sm:p-9">{children}</div>
        <nav className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Policies">
          <Link className="text-primary underline underline-offset-4" to="/privacy">Privacy</Link>
          <Link className="text-primary underline underline-offset-4" to="/image-use">Image use</Link>
          <Link className="text-primary underline underline-offset-4" to="/demo-disclosure">Demo disclosures</Link>
          <Link className="text-primary underline underline-offset-4" to="/auth">Sign in</Link>
        </nav>
      </main>
    </Stage>
  );
}
