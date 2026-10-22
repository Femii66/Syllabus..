import { createFileRoute } from "@tanstack/react-router";
import { Nfc, GraduationCap, CreditCard, WalletCards } from "lucide-react";
import { Phone, Stage, PageHeading } from "@/components/phone";
export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — $yllabus" },
      {
        name: "description",
        content: "Your Student ID, debit card and credit card in a simulated digital wallet.",
      },
      { property: "og:title", content: "Wallet — $yllabus" },
      { property: "og:description", content: "Three cards, one student wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wallet,
});
function Wallet() {
  return (
    <Stage>
      <Phone>
        <PageHeading title="Wallet" subtitle="Your campus identity. Your everyday cards." />
        <div className="grid items-start gap-12 py-8 lg:grid-cols-2">
          <div className="wallet-stack" aria-label="Card wallet">
            <div className="payment-card credit">
              <div className="flex justify-between text-sm font-semibold">
                <span>$yllabus Credit</span>
                <Nfc className="size-5" aria-label="Simulated tap to pay" />
              </div>
              <div className="chip mt-10" />
              <p className="mt-5 font-mono">•••• 9038</p>
              <div className="mt-4 flex justify-between text-xs">
                <span>MAYA KESSLER</span>
                <span>CREDIT</span>
              </div>
            </div>
            <div className="payment-card debit">
              <div className="flex justify-between text-sm font-semibold">
                <span>$yllabus Debit</span>
                <Nfc className="size-5" aria-label="Simulated tap to pay" />
              </div>
              <div className="chip mt-10" />
              <p className="mt-5 font-mono">•••• 4471</p>
              <div className="mt-4 flex justify-between text-xs">
                <span>MAYA KESSLER</span>
                <span>DEBIT</span>
              </div>
            </div>
            <div className="payment-card student">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">$yllabus.</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px]">STUDENT ID</span>
                  <Nfc className="size-5" aria-label="Simulated tap to pay" />
                </div>
              </div>
              <div className="chip mt-7" />
              <p className="mt-4 text-xl font-semibold">Maya Kessler</p>
              <p className="mt-1 text-xs opacity-70">Student · Class of 2027</p>
              <div className="mt-5 flex justify-between gap-2 text-[11px]">
                <span className="font-mono">ID 0482 1193</span>
                <span>Bulldog Bucks · $62.20</span>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="mb-5 text-lg font-semibold">Your cards</h2>
            {[
              {
                label: "Student ID",
                detail: "State University · Class of 2027",
                number: "0482 1193",
                icon: GraduationCap,
              },
              {
                label: "Debit card",
                detail: "Checking account",
                number: "•••• 4471",
                icon: WalletCards,
              },
              {
                label: "Credit card",
                detail: "$yllabus Credit",
                number: "•••• 9038",
                icon: CreditCard,
              },
            ].map((c) => (
              <div
                key={c.label}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b py-5"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
                  <p className="mt-3 font-mono text-xs">{c.number}</p>
                </div>
              </div>
            ))}
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Nfc className="size-4" />
              Contactless indicators are simulated.
            </p>
          </div>
        </div>
      </Phone>
    </Stage>
  );
}