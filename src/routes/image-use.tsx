import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/image-use")({
  head: () => ({ meta: [{ title: "Image use — $yllabus" }, { name: "description", content: "Optional image consent in the $yllabus prototype." }] }),
  component: ImageUse,
});
function ImageUse() {
  return (
    <LegalPage title="Image use" subtitle="Your choice, separate from creating an account. Last updated November 9, 2026.">
      <section>
        <h2 className="mb-2 text-lg font-semibold">Currently a prototype</h2>
        <p>The wallet displays fictional student ID and payment card artwork. These are not official IDs or issued payment cards. Personal-photo upload and facial recognition are not enabled as part of the demonstrated wallet.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Optional future photo features</h2>
        <p>If photo features are added, images should be used only for the purpose explained at the time of upload. Declining optional image consent must not prevent basic account creation. Separate permission would be needed for publicity or marketing use.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Only use images you have rights to share</h2>
        <p>Do not upload photos of others without their permission, copyrighted work without authorization, or identification documents to this educational prototype. Content reporting, copyright-request handling, and photo removal workflows must be designed before public uploads are enabled.</p>
      </section>
      <p className="rounded-lg bg-secondary p-4 text-xs text-muted-foreground">No optional image permission is required to use the current demo. This page is informational and does not imply that photo upload is currently available.</p>
    </LegalPage>
  );
}
