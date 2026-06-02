import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { findAllShortestPaths, isValidWord, type WordLength } from "@/lib/wordLadder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Word Ladder Solver" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
  component: Index,
});

function Index() {
  const [length, setLength] = useState<WordLength>(4);
  const [start, setStart] = useState("DARK");
  const [goal, setGoal] = useState("POOP");
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  const switchLength = (n: WordLength) => {
    setLength(n);
    setPaths(null);
    setError(null);
    if (n === 4) {
      setStart("DARK");
      setGoal("POOP");
    } else if (n === 5) {
      setStart("FLOWN");
      setGoal("BRAID");
    } else {
      setStart("CRAWLS");
      setGoal("BLAZED");
    }
  };

  const solve = () => {
    setError(null);
    setPaths(null);
    const s = start.trim().toUpperCase();
    const g = goal.trim().toUpperCase();
    if (s.length !== length || g.length !== length) {
      setError(`Both words must be exactly ${length} letters.`);
      return;
    }
    if (!isValidWord(s, length)) return setError(`"${s}" is not in the dictionary.`);
    if (!isValidWord(g, length)) return setError(`"${g}" is not in the dictionary.`);
    setSolving(true);
    setTimeout(() => {
      const result = findAllShortestPaths(s, g, length);
      if (result.length === 0) setError("No path exists between these words.");
      else setPaths(result);
      setSolving(false);
    }, 0);
  };

  const clamp = (v: string) => v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Word Ladder Solver</h1>
          <p className="mt-2 text-muted-foreground">
            Enter two words of the same length. Get every shortest ladder — one letter change at a time.
          </p>
        </header>

        <div className="mb-6 inline-flex rounded-md border bg-muted p-1">
          {[4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => switchLength(n as WordLength)}
              className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                length === n
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n} letters
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {length === 4 ? (
            <>
              <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Weaver</a>
              <a href="https://flipple.clevergoat.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Flipple</a>
              <a href="https://poople.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Poople</a>
            </>
          ) : length === 5 ? (
            <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Weaver</a>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium">Start</label>
            <Input
              value={start}
              onChange={(e) => setStart(clamp(e.target.value))}
              maxLength={length}
              className="font-mono text-lg uppercase tracking-widest"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Goal</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(clamp(e.target.value))}
              maxLength={length}
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
