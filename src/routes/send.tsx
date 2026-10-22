import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, ArrowUpRight, ArrowDownLeft, Delete } from "lucide-react";
import { useState } from "react";
import { Phone, Stage, PageHeading } from "@/components/phone";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send & receive — $yllabus" },
      {
        name: "description",
        content: "Simulate sending or requesting money from your Student ID or debit card.",
      },
      { property: "og:title", content: "Send & receive — $yllabus" },
      { property: "og:description", content: "Student ID and debit card simulated transfers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Send,
});
const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
const sources = [
  { id: "student-id", label: "Student ID", detail: "Bulldog Bucks · $62.20" },
  { id: "debit", label: "Debit card", detail: "Checking ·· 4471" },
] as const;
function Send() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"student-id" | "debit">("debit");
  function press(key: string) {
    setAmount((c) => {
      if (key === "⌫") return c.slice(0, -1);
      if (key === "." && c.includes(".")) return c;
      if (c.includes(".") && (c.split(".")[1]?.length ?? 0) >= 2) return c;
      if (c.length >= 7) return c;
      return c + key;
    });
  }
  const numeric = Number(amount || "0");
  return (
    <Stage>
      <Phone>
        <PageHeading
          title="Send & receive"
          subtitle="A small gesture. A shared lunch. A little support."
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section>
            <div className="mb-8 grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
              {(["send", "receive"] as const).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "default" : "ghost"}
                  className="h-11"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                >
                  {m === "send" ? <ArrowUpRight /> : <ArrowDownLeft />}
                  {m === "send" ? "Send" : "Receive"}
                </Button>
              ))}
            </div>
            <h2 className="text-lg font-semibold">
              {mode === "send" ? "Send money" : "Request money"}
            </h2>
            <div className="my-6 flex items-center gap-3 border-y py-6">
              <span className="avatar">JO</span>
              <div>
                <p className="text-sm font-semibold">Jordan Okafor</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mode === "send" ? "Recipient" : "Request from"}
                </p>
              </div>
            </div>
            <fieldset>
              <legend className="mb-4 text-sm font-semibold">
                {mode === "send" ? "Send from" : "Receive into"}
              </legend>
              <div className="space-y-3">
                {sources.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    aria-pressed={source === item.id}
                    onClick={() => setSource(item.id)}
                    className={`h-20 w-full justify-start gap-4 px-5 ${source === item.id ? "border-primary bg-brand-soft" : ""}`}
                  >
                    <CreditCard />
                    <span className="text-left">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                    {source === item.id && <Check className="ml-auto text-primary" />}
                  </Button>
                ))}
              </div>
            </fieldset>
            <p className="mt-6 text-xs leading-6 text-muted-foreground">
              Demo transfer · No real money will be sent or requested.
            </p>
          </section>
          <section className="glass px-6 py-8 sm:px-10">
            <p className="text-center text-xs text-muted-foreground">Amount in USD</p>
            <p
              aria-live="polite"
              className="tnum my-6 break-all text-center text-5xl font-semibold"
            >
              ${amount || "0"}
            </p>
            <p className="mb-6 text-center text-xs text-muted-foreground">
              {sources.find((s) => s.id === source)?.detail}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {keys.map((k) => (
                <Button
                  key={k}
                  aria-label={k === "⌫" ? "Delete digit" : k}
                  variant="ghost"
                  className="h-14 text-xl"
                  onClick={() => press(k)}
                >
                  {k === "⌫" ? <Delete /> : k}
                </Button>
              ))}
            </div>
            <Button
              disabled={!Number.isFinite(numeric) || numeric <= 0}
              onClick={() =>
                navigate({ to: "/confirmation", search: { amount: numeric, mode, source } })
              }
              className="mt-7 h-12 w-full"
            >
              {mode === "send" ? "Send" : "Request"}
              <ArrowUpRight />
            </Button>
          </section>
        </div>
      </Phone>
    </Stage>
  );
}