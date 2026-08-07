import { createFileRoute, Link } from "@tanstack/react-router";
import { OG_IMAGE_URL } from "@/lib/seo";
import { useEffect, useState } from "react";
import faqRepositories from "@/data/faqRepositories.json";



const FAQ_REPOS_URL =
  "https://raw.githubusercontent.com/nahiphog/BigBigSolver/refs/heads/main/repositories_FAQ.json";

type FaqRepo = { Name: string; Hyperlink: string };


export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Solver Sanctuary" },
      { name: "description", content: "Frequently asked questions about Solver Sanctuary: word lists, new solvers, and recommended puzzle repositories." },
      { property: "og:title", content: "FAQ — Solver Sanctuary" },
      { property: "og:description", content: "Frequently asked questions about Solver Sanctuary: word lists, new solvers, and recommended puzzle repositories." },
      { property: "og:url", content: "https://solversanctuary.com/faq" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FAQ — Solver Sanctuary" },
      { name: "twitter:description", content: "Frequently asked questions about Solver Sanctuary: word lists, new solvers, and recommended puzzle repositories." },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://solversanctuary.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Where did I get the word list from?",
              acceptedAnswer: { "@type": "Answer", text: "From norvig.com/ngrams/word.list" },
            },
            {
              "@type": "Question",
              name: "Would you be adding more puzzle solvers to this site?",
              acceptedAnswer: { "@type": "Answer", text: "Yes, but only for those that I'm passionate in." },
            },
            {
              "@type": "Question",
              name: "Why do some websites not accept certain words?",
              acceptedAnswer: { "@type": "Answer", text: "The word list that they used might differ from mine." },
            },
          ],
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [repos, setRepos] = useState<FaqRepo[]>(faqRepositories as FaqRepo[]);
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

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="font-semibold">What other games do you personally recommend?</p>
            <div className="mt-2 space-y-3">
              <div>
                <p className="font-medium">S-tier:</p>
                <ol className="mt-1 list-none space-y-1">
                  <li>
                    i.{" "}
                    <a className="text-primary underline" href="https://en.wikipedia.org/wiki/Nier:_Automata" target="_blank" rel="noopener noreferrer">Nier: Automata</a>
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-medium">A-tier:</p>
                <ol className="mt-1 list-none space-y-1">
                  <li>
                    ii.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id6780127023" target="_blank" rel="noopener noreferrer">Mine-O-Gram</a>
                  </li>
                  <li>
                    iii.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id6759974345" target="_blank" rel="noopener noreferrer">Hedgemaze</a>
                  </li>
                  <li>
                    iv.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id1283262104" target="_blank" rel="noopener noreferrer">Fillomino infinity</a>
                  </li>
                  <li>
                    v.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id1580054076" target="_blank" rel="noopener noreferrer">Pocket Chess</a>
                  </li>
                  <li>
                    vi.{" "}
                    <a className="text-primary underline" href="https://enclose.horse/" target="_blank" rel="noopener noreferrer">Enclose Horse</a>
                  </li>
                  <li>
                    vii.{" "}
                    <a className="text-primary underline" href="https://johalloran.dev/lawndle/" target="_blank" rel="noopener noreferrer">Lawndle</a>
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-medium">B-tier:</p>
                <ol className="mt-1 list-none space-y-1">
                  <li>
                    viii.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id1489118195" target="_blank" rel="noopener noreferrer">Good Sudoku</a>
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-medium">B-tier:</p>
                <ol className="mt-1 list-none space-y-1">
                  <li>
                    vi.{" "}
                    <a className="text-primary underline" href="https://apps.apple.com/app/id1489118195" target="_blank" rel="noopener noreferrer">Good Sudoku</a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
