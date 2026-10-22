import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Logo, Phone, Stage } from "@/components/phone";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to $yllabus" },
      {
        name: "description",
        content:
          "$yllabus combines checking and savings with meal swipes, Bulldog Bucks, book vouchers, NIL accounts and athlete stipends.",
      },
      { property: "og:title", content: "Welcome to $yllabus" },
      {
        property: "og:description",
        content: "Banking, meal swipes, Bulldog Bucks and NIL — together on one tap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <Stage>
      <Phone className="p-6">
        <Logo />
        <div className="mx-auto mt-auto mb-auto w-full max-w-xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Welcome</p>
          <h1 className="mx-auto max-w-[9ch] font-display text-5xl font-bold leading-[1.02] text-balance">
            Money for campus life.
          </h1>
          <p className="mx-auto mt-5 max-w-[27ch] text-sm leading-6 text-ink/60">
            One secure place for everyday banking, your student ID, campus funds, and payments.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-paper transition-transform duration-300 hover:-translate-y-0.5"
        >
          Explore demo
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link to="/auth" className="mx-auto mt-3 block text-center text-xs font-semibold text-ink/65 underline-offset-4 hover:underline">Sign in or create an account</Link>
      </Phone>
    </Stage>
  );
}
