import { createFileRoute } from "@tanstack/react-router";
import { Phone, Stage, PageHeading } from "@/components/phone";
import { IlpDemoPanel, DemoWalletSummary } from "@/components/ilp-demo";
export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send & receive — $yllabus" },
      {
        name: "description",
        content: "Send or request simulated USD from your $yllabus demo payment wallet.",
      },
      { property: "og:title", content: "Send & receive — $yllabus" },
      { property: "og:description", content: "Quote, confirm and track simulated demo wallet payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Send,
});
function Send() {
  return (
    <Stage>
      <Phone>
        <PageHeading
          title="Send & receive"
          subtitle="A small gesture. A shared lunch. A little support."
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <IlpDemoPanel />
          <DemoWalletSummary />
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Payments use your demo payment wallet only. Checking, savings, Student ID and card balances
          elsewhere are static examples and are never charged. No real money moves.
        </p>
      </Phone>
    </Stage>
  );
}