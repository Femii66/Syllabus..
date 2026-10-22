import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
const campusImage = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=85";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to $yllabus" },
      {
        name: "description",
        content: "Everyday banking, campus funds and your student wallet, together.",
      },
      { property: "og:title", content: "Welcome to $yllabus" },
      { property: "og:description", content: "A new chapter in student banking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});
function Welcome() {
  return (
    <Stage>
      <div className="mx-auto max-w-[1440px] px-6 pb-12 lg:px-12">
        <div className="hero-cover h-[520px] sm:h-[570px]">
          <img
            src={campusImage}
            alt="University campus with students walking to class"
            width={1600}
            height={640}
          />
          <div className="hero-copy max-w-xl pr-6">
            <p className="mb-5 text-sm">WELCOME TO YOUR NEXT CHAPTER</p>
            <h1 className="text-5xl font-bold sm:text-6xl">$yllabus</h1>
            <p className="mt-5 max-w-md text-lg leading-8">
              Money for campus life. Everyday banking, your student ID, and campus funds — together.
            </p>
            <Button asChild className="mt-8 h-12 px-6">
              <Link to="/dashboard">
                Get started <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-6 border-b py-10 sm:grid-cols-3">
          {[
            { label: "Everyday banking", detail: "Checking & Savings" },
            { label: "Campus essentials", detail: "Bulldog Bucks · Meal swipes · Vouchers" },
            { label: "Your digital wallet", detail: "Student ID · Debit · Credit" },
          ].map((x) => (
            <div key={x.label}>
              <h2 className="font-semibold">{x.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{x.detail}</p>
            </div>
          ))}
        </div>
        <p className="pt-6 text-xs text-muted-foreground">
          Simulated banking only · No real financial transactions
        </p>
      </div>
    </Stage>
  );
}