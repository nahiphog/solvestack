import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import faqRepositories from "@/data/faqRepositories.json";



const FAQ_REPOS_URL =
  "https://raw.githubusercontent.com/nahiphog/BigBigSolver/refs/heads/main/repositories_FAQ.json";

type FaqRepo = { Name: string; Hyperlink: string };


export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Solver Sanctuary" },
      { name: "description", content: "Frequently asked questions about Solver Sanctuary." },
      { property: "og:title", content: "FAQ — Solver Sanctuary" },
      { property: "og:description", content: "Frequently asked questions about Solver Sanctuary." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [repos, setRepos] = useState<FaqRepo[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(FAQ_REPOS_URL)
      .then((r) => r.json())
      .then((data: FaqRepo[]) => {
        if (!cancelled && Array.isArray(data)) setRepos(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
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
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="font-semibold">Where did I get the word list from?</p>
            <p className="mt-1">
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

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="font-semibold">Would you be adding more puzzle solvers to this site? If yes, which ones?</p>
            <p className="mt-1">Yes. But only for those that I&apos;m passionate in.</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="font-semibold">Why some websites don&apos;t accept certain words?</p>
            <p className="mt-1">The word list that they used might differ from mine.</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="font-semibold">Where do you find such puzzles? What other repositories of puzzles do you recommend?</p>
            <p className="mt-1">I found them on specific Discord servers, and some bingeworthy instagram profiles. The repositories (in no particular order) are:</p>
            {(() => {
              const items = repos;
              return (
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
                  {items.map(({ Name, Hyperlink }) => (
                    <a
                      key={Hyperlink}
                      className="text-primary underline"
                      href={Hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {Name}
                    </a>
                  ))}
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}
