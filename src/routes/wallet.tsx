import { createFileRoute } from "@tanstack/react-router";
import { Nfc } from "lucide-react";
import { Phone, Stage, TabBar } from "@/components/phone";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — $yllabus" },
      {
        name: "description",
        content: "Your Student ID, debit card, and credit card in one digital wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Wallet — $yllabus" },
      {
        property: "og:description",
        content: "Tap your student ID to pay anywhere on campus.",
      },
    ],
  }),
  component: Wallet,
});

function Wallet() {
  return (
    <Stage>
      <Phone className="p-6">
        <div className="pointer-events-none absolute -right-12 top-16 size-44 rounded-full bg-accent/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-10 size-40 rounded-full bg-violet/25 blur-2xl" />
        <p className="font-display text-lg font-bold">Wallet</p>
        <p className="text-xs text-ink/50">Three cards, ready to tap anywhere on campus.</p>

        <div className="group relative mt-4 h-[286px] shrink-0" aria-label="Card wallet">
          <div className="wallet-card absolute inset-x-2 top-0 z-10 h-[180px] overflow-hidden rounded-3xl bg-gold p-4 text-ink ring-1 ring-ink/10">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold">$yllabus Credit</span>
              <Nfc className="size-5" aria-label="Tap to pay enabled" />
            </div>
            <div className="mt-9 h-7 w-10 rounded-md bg-paper/55" />
            <p className="mt-4 font-mono text-xs">•••• 9038</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs font-semibold">MAYA KESSLER</span>
              <span className="font-display text-sm font-bold">CREDIT</span>
            </div>
          </div>

          <div className="wallet-card absolute inset-x-1 top-[52px] z-20 h-[180px] overflow-hidden rounded-3xl bg-accent p-4 text-accent-foreground ring-1 ring-ink/10">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold">$yllabus Debit</span>
              <Nfc className="size-5" aria-label="Tap to pay enabled" />
            </div>
            <div className="mt-9 h-7 w-10 rounded-md bg-paper/55" />
            <p className="mt-4 font-mono text-xs">•••• 4471</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs font-semibold">MAYA KESSLER</span>
              <span className="font-display text-sm font-bold">DEBIT</span>
            </div>
          </div>

          <div className="wallet-card absolute inset-x-0 top-[104px] z-30 h-[180px] overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-violet/70 p-4 text-paper ring-1 ring-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-white/15 font-display text-base font-bold">
                  $
                </div>
                <span className="font-display text-sm font-semibold tracking-tight">yllabus</span>
              </div>
              <div className="flex items-center gap-2">
                <Nfc className="size-5" aria-label="Tap to pay enabled" />
                <span className="rounded-full bg-paper/15 px-2 py-0.5 text-[10px] font-medium tracking-wide">
                  STUDENT ID
                </span>
              </div>
            </div>
            <div className="mt-4 h-7 w-11 rounded-md bg-gold/80" />
            <p className="mt-2 font-display text-lg font-semibold">Maya Kessler</p>
            <p className="text-xs text-paper/60">Student · Class of 2027</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-paper/70">
              <span className="font-mono">ID 0482 1193</span>
              <span>Bulldog Bucks · $62.20</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <TabBar />
        </div>
      </Phone>
    </Stage>
  );
}
