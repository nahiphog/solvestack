import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Solve Stack" },
      { name: "description", content: "Frequently asked questions about Solve Stack." },
      { property: "og:title", content: "FAQ — Solve Stack" },
      { property: "og:description", content: "Frequently asked questions about Solve Stack." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">FAQ</h1>
          <Link
            to="/"
            className="shrink-0 rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            ← Home
          </Link>
        </header>

        <div className="space-y-6 text-base leading-relaxed">
          <p className="font-semibold">Frequently Asked Questions:</p>

          <div>
            <p className="font-semibold">Q1. Where did I get the word list from?</p>
            <p className="mt-1">
              A1.{" "}
              <a
                className="text-primary underline"
                href="https://norvig.com/ngrams/word.list"
                target="_blank"
                rel="noopener noreferrer"
              >
                Here
              </a>
            </p>
          </div>

          <div>
            <p className="font-semibold">Q2. Would you be adding more puzzle solvers to this site? If yes, which ones?</p>
            <p className="mt-1">A2. Yes. But only for those that I&apos;m passionate in.</p>
          </div>

          <div>
            <p className="font-semibold">Q3. Why some websites don&apos;t accept certain words?</p>
            <p className="mt-1">A3. The word list that they used might differ from mine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
