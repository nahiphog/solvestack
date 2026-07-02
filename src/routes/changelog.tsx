import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Solver Sanctuary" },
      { name: "description", content: "Recent updates and changes to Solver Sanctuary." },
      { property: "og:title", content: "Changelog — Solver Sanctuary" },
      { property: "og:description", content: "Recent updates and changes to Solver Sanctuary." },
    ],
  }),
  component: ChangelogPage,
});

type Entry = { heading: string; items: string[] };

function parseChangelog(text: string): Entry[] {
  const entries: Entry[] = [];
  let current: Entry | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d+\./.test(line)) {
      if (current) current.items.push(line.replace(/^\d+\.\s*/, ""));
    } else if (line.endsWith(":")) {
      if (current) entries.push(current);
      current = { heading: line.replace(/:$/, ""), items: [] };
    }
  }
  if (current) entries.push(current);
  return entries;
}

function ChangelogPage() {
  const entries = parseChangelog(RAW);
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

        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.heading} className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{entry.heading}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-relaxed">
                {entry.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RAW = `July 02 2026:
1. Rectified and reuploaded the solvers "Flipping letters" and "Splitle".
2. Fixed the feedback form bug.
3. Added a changelog page.

June 30 2026:
1. Changed the title of this website to "Solver Sanctuary", as per the suggestion from a YouTube user.

June 01 2026 to June 29 2026:
1. Created this page.
2. Added over 15 solvers into the site.
3. Added the About page and the FAQ page.
`;
