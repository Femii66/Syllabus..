import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Monitor, ShieldCheck, LogOut } from "lucide-react";
import { Stage, Phone, PageHeading } from "@/components/phone";
import { ThemeChoices } from "@/components/theme";
import { useSession } from "@/components/session";
import { Button } from "@/components/ui/button";
import { authErrorMessage } from "@/lib/auth-errors";
export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — $yllabus" },
      { name: "description", content: "Manage your appearance preferences and student account." },
      { property: "og:title", content: "Settings — $yllabus" },
      { property: "og:description", content: "Your theme and account preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});
function Settings() {
  const { user, signOut } = useSession();
  const [error, setError] = useState("");
  return (
    <Stage>
      <Phone>
        <PageHeading title="Settings" subtitle="A workspace that feels like you." />
        <div className="max-w-2xl">
          <section className="border-b py-6">
            <h2 className="mb-2 flex items-center gap-3 text-lg font-semibold">
              <Monitor className="size-5 text-primary" />
              Appearance
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">Theme preference</p>
            <ThemeChoices />
          </section>
          <section className="py-8">
            <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
              <ShieldCheck className="size-5 text-primary" />
              Account
            </h2>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>{user ? "Signed in" : "Guest demo"}</dd>
              </div>
              {user && (
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Student email</dt>
                  <dd className="break-all text-right">{user.email}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Banking</dt>
                <dd>Simulated only</dd>
              </div>
            </dl>
            <div className="mt-8">
              {user ? (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signOut();
                    } catch (e) {
                      setError(authErrorMessage(e));
                    }
                  }}
                >
                  <LogOut />
                  Sign out
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign in / Create account</Link>
                </Button>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            )}
          </section>
        </div>
      </Phone>
    </Stage>
  );
}