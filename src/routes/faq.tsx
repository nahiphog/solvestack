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
              const items: [string, string][] = [
                ["Playlin", "https://playlin.io/"],
                ["New York Times", "https://www.nytco.com/games/"],
                ["Boston Globe", "https://www.bostonglobe.com/games/"],
                ["The Atlantic", "https://www.theatlantic.com/games/"],
                ["OneLook", "https://onelook.com/games"],
                ["Netflix", "https://www.netflix.com/tudum/games"],
                ["PuzzMallow", "https://puzzmallow.com/"],
                ["Kelly Dornhaus", "https://kellydornhaus.com/"],
                ["Merriam Webster", "https://www.merriam-webster.com/games/"],
                ["Reddit games", "https://www.reddit.com/r/GamesOnReddit/"],
                ["By Thomas", "https://bythomas.co.uk/"],
                ["Clever Goat", "https://clevergoat.com/"],
                ["Coffee First", "https://coffeefirst.games/"],
                ["Dles", "https://dles.gg"],
                ["USA today", "https://play.usatoday.com/"],
                ["The Washington Post", "https://www.washingtonpost.com/games/"],
                ["Chicago Tribune", "https://fun.chicagotribune.com/"],
                ["The Independent", "https://puzzles.independent.co.uk/"],
              ];
              return (
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
                  {items.map(([label, href]) => (
                    <a
                      key={href}
                      className="text-primary underline"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
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
