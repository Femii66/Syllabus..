import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy notice — $yllabus" }, { name: "description", content: "How the $yllabus educational prototype handles information." }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy notice" subtitle="A plain-language explanation of this educational prototype. Last updated November 9, 2026.">
      <section>
        <h2 className="mb-2 text-lg font-semibold">What $yllabus is</h2>
        <p>$yllabus is a demonstration app. It does not provide real bank accounts, tuition payment processing, loans, or official university account access. Please avoid using sensitive financial documents or personal information while testing.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Information used for accounts</h2>
        <p>If you choose to register, the sign-in system handles your email address, password, and account information. Signup asks for an 18+ confirmation, policy acknowledgment, and your optional image-use preference. Your password is handled by the authentication service rather than displayed in the app.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Demo wallet and imported statements</h2>
        <p>Simulated wallet transactions and balances are kept in your browser's local storage and are not real money. They may disappear if you clear browser data or switch devices. The optional tuition import reads a PDF or CSV on your device and stores only the statement details you choose to confirm in your account's database record; the original document is not uploaded by that feature.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Storage and service providers</h2>
        <p>The prototype uses outside hosting and authentication/database services. Demo wallet data is local to your browser; signed-in account records and confirmed tuition snapshots may be processed by the app's hosting and database providers. A production privacy policy would need to identify the actual operator, contact details, retention periods, and all vendors before launch.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Your choices</h2>
        <p>You can explore the guest demo without registering, reset your simulated wallet, and delete a saved tuition snapshot from the Campus page. Image-use consent is optional. Avoid uploading statements with details you do not want processed. This prototype does not currently provide a complete automated account-deletion process.</p>
      </section>
      <p className="rounded-lg bg-secondary p-4 text-xs text-muted-foreground">This notice describes the current prototype. It is not a substitute for a professionally reviewed privacy policy before public launch.</p>
    </LegalPage>
  );
}
