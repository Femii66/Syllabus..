import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";
import { useState } from "react";
import { Phone, Stage, TabBar } from "@/components/phone";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send & receive — $yllabus" },
      {
        name: "description",
        content: "Send or receive money using your Student ID or bank debit card.",
      },
      { property: "og:title", content: "Send & receive — $yllabus" },
      { property: "og:description", content: "Move money across campus in a couple of taps." },
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

type SourceId = (typeof sources)[number]["id"];

function Send() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<SourceId>("debit");

  function press(key: string) {
    setAmount((current) => {
      if (key === "⌫") return current.slice(0, -1);
      if (key === "." && current.includes(".")) return current;
      if (current.includes(".") && (current.split(".")[1]?.length ?? 0) >= 2) return current;
      if (current.length >= 7) return current;
      return current + key;
    });
  }

  const display = amount === "" ? "0" : amount;
  const numeric = Number(amount || "0");
  const selectedSource = sources.find((item) => item.id === source) ?? sources[1];

  return (
    <Stage>
      <Phone className="p-5">
        <div className="pointer-events-none absolute -right-10 top-10 size-40 rounded-full bg-violet/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            {mode === "send" ? "Send money" : "Request money"}
          </p>
          <button
            onClick={() => setMode(mode === "send" ? "receive" : "send")}
            className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/60"
          >
            {mode === "send" ? "Receive" : "Send"}
          </button>
        </div>

        <div className="glass mt-3 flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/60">
          <div className="grid size-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            JO
          </div>
          <div className="text-sm font-semibold">Jordan Okafor</div>
          <span className="ml-auto text-xs text-ink/40">›</span>
        </div>

        <fieldset className="mt-3">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            {mode === "send" ? "Send from" : "Receive into"}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {sources.map((item) => {
              const selected = item.id === source;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSource(item.id)}
                  className={`relative min-h-16 rounded-2xl p-2.5 text-left ring-1 transition-colors ${
                    selected ? "bg-ink text-paper ring-ink" : "glass text-ink ring-white/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="size-3.5" aria-hidden="true" />
                    <span className="text-xs font-semibold">{item.label}</span>
                    {selected && <Check className="ml-auto size-3.5" aria-hidden="true" />}
                  </div>
                  <p className={`mt-1 text-[9px] ${selected ? "text-paper/60" : "text-ink/45"}`}>
                    {item.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-3 text-center">
          <p className="tnum font-display text-5xl font-bold tracking-tight">
            $<span className={amount === "" ? "text-ink/25" : ""}>{display}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-ink/40">{selectedSource.detail}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="glass grid h-12 place-items-center rounded-2xl font-display text-lg font-semibold ring-1 ring-white/60 transition-transform duration-200 active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        <button
          disabled={numeric <= 0}
          onClick={() =>
            navigate({
              to: "/confirmation",
              search: { amount: numeric, mode, source },
            })
          }
          className="mt-4 w-full rounded-2xl bg-ink py-4 text-sm font-semibold text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {mode === "send" ? "Send" : "Request"}
        </button>

        <TabBar />
      </Phone>
    </Stage>
  );
}
