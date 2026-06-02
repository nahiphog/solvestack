import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { findAllShortestPaths, isValidWord } from "@/lib/wordLadder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Word Ladder Solver" },
      { name: "description", content: "Find all shortest word ladders between two 4-letter words." },
    ],
  }),
  component: Index,
});

function Index() {
  const [start, setStart] = useState("DARK");
  const [goal, setGoal] = useState("POOP");
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  const solve = () => {
    setError(null);
    setPaths(null);
    const s = start.trim().toUpperCase();
    const g = goal.trim().toUpperCase();
    if (s.length !== 4 || g.length !== 4) {
      setError("Both words must be exactly 4 letters.");
      return;
    }
    if (!isValidWord(s)) return setError(`"${s}" is not in the dictionary.`);
    if (!isValidWord(g)) return setError(`"${g}" is not in the dictionary.`);
    setSolving(true);
    setTimeout(() => {
      const result = findAllShortestPaths(s, g);
      if (result.length === 0) setError("No path exists between these words.");
      else setPaths(result);
      setSolving(false);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Word Ladder Solver</h1>
          <p className="mt-2 text-muted-foreground">
            Enter two 4-letter words. Get every shortest ladder between them — one letter change at a time.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium">Start</label>
            <Input
              value={start}
              onChange={(e) => setStart(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              className="font-mono text-lg uppercase tracking-widest"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Goal</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              className="font-mono text-lg uppercase tracking-widest"
            />
          </div>
          <Button onClick={solve} disabled={solving} size="lg">
            {solving ? "Solving..." : "Solve"}
          </Button>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {paths && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">
              {paths.length} optimal {paths.length === 1 ? "path" : "paths"} · {paths[0].length - 1} steps
            </h2>
            <ol className="space-y-3">
              {paths.map((path, i) => (
                <li
                  key={i}
                  className="rounded-lg border bg-card p-4 font-mono text-card-foreground"
                >
                  <span className="mr-3 text-xs text-muted-foreground">#{i + 1}</span>
                  {path.map((w, j) => (
                    <span key={j}>
                      <span className="font-semibold tracking-widest">{w}</span>
                      {j < path.length - 1 && (
                        <span className="mx-2 text-muted-foreground">→</span>
                      )}
                    </span>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
