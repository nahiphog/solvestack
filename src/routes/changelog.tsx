import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const CHANGELOG_URL =
  "https://raw.githubusercontent.com/nahiphog/BigBigSolver/refs/heads/main/changelog.txt";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Solver Sanctuary" },
      { name: "description", content: "Recent updates, new solvers, and fixes shipped to Solver Sanctuary." },
      { property: "og:title", content: "Changelog — Solver Sanctuary" },
      { property: "og:description", content: "Recent updates, new solvers, and fixes shipped to Solver Sanctuary." },
      { property: "og:url", content: "https://solversanctuary.com/changelog" },
      { property: "og:type", content: "article" },
      { property: "og:image", content: "https://solversanctuary.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Changelog — Solver Sanctuary" },
      { name: "twitter:description", content: "Recent updates, new solvers, and fixes shipped to Solver Sanctuary." },
      { name: "twitter:image", content: "https://solversanctuary.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://solversanctuary.com/changelog" }],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const [text, setText] = useState<string>("Loading…");

  useEffect(() => {
    let cancelled = false;
    fetch(`${CHANGELOG_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch((e) => {
        if (!cancelled) setText(`Failed to load changelog: ${String(e)}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <Link
            to="/about"
            className="shrink-0 rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            ← About
          </Link>
        </header>
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{text}</pre>
      </div>
    </div>
  );
}
