import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/demo-disclosure")({
  head: () => ({ meta: [{ title: "Demo disclosures — $yllabus" }, { name: "description", content: "What $yllabus does and does not provide." }] }),
  component: DemoDisclosure,
});
function DemoDisclosure() {
  return (
    <LegalPage title="About this demo" subtitle="Know what is simulated and what is not. Updated November 9, 2026.">
      <section>
        <h2 className="mb-2 text-lg font-semibold">Not a bank or payment provider</h2>
        <p>$yllabus is an educational fintech interface prototype, not a bank, lender, money transmitter, or officially connected university service. Example balances, cards, student identities, Interledger-style transfers, receipts, and requests are fictional. No actual money is held, sent, received, lent, or insured.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">University access</h2>
        <p>Entering an email ending in @aamu.edu is not proof that the person owns that mailbox or is a currently enrolled student. University single sign-on and tuition system integrations are not active in this demo. Imported tuition amounts are student-confirmed, not university-verified.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">No paid service or promotional texting</h2>
        <p>The current prototype has no subscriptions, recurring charges, payment-plan contracts, commercial lending, or marketing text messages. These features must receive their own clear terms, consent processes, and professional compliance review before they are considered for a real launch.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Age and feedback</h2>
        <p>Account creation is intended for people aged 18 or older and currently relies on self-attestation. This does not constitute identity or age verification. Guest mode is available for exploring the fictional app without registering.</p>
      </section>
      <p className="rounded-lg bg-secondary p-4 text-xs text-muted-foreground">These disclosures are for transparency in a demonstration and are not a license, legal opinion, or financial guarantee.</p>
    </LegalPage>
  );
}
