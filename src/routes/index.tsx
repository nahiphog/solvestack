import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { findAllShortestPaths, isValidWord, MODE_WORD_LENGTH, type Mode } from "@/lib/wordLadder";
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

const MODES: { id: Mode; label: string }[] = [
  { id: 4, label: "4 letters" },
  { id: 5, label: "5 letters" },
  { id: 6, label: "6 letters" },
  { id: "splice", label: "Misc" },
];

const DEFAULTS: Record<string, { start: string; goal: string }> = {
  "4": { start: "DARK", goal: "POOP" },
  "5": { start: "FLOWN", goal: "BRAID" },
  "6": { start: "CRAWLS", goal: "BLAZED" },
  splice: { start: "BAGEL", goal: "TOWER" },
};

function Index() {
  const [mode, setMode] = useState<Mode>(4);
  const [start, setStart] = useState("DARK");
  const [goal, setGoal] = useState("POOP");
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  const wordLength = MODE_WORD_LENGTH[String(mode)];

  const switchMode = (m: Mode) => {
    setMode(m);
    setPaths(null);
    setError(null);
    const d = DEFAULTS[String(m)];
    setStart(d.start);
    setGoal(d.goal);
  };

  const solve = () => {
    setError(null);
    setPaths(null);
    const s = start.trim().toUpperCase();
    const g = goal.trim().toUpperCase();
    if (s.length !== wordLength || g.length !== wordLength) {
      setError(`Both words must be exactly ${wordLength} letters.`);
      return;
    }
    if (!isValidWord(s, mode)) return setError(`"${s}" is not in the dictionary.`);
    if (!isValidWord(g, mode)) return setError(`"${g}" is not in the dictionary.`);
    setSolving(true);
    setTimeout(() => {
      const result = findAllShortestPaths(s, g, mode);
      if (result.length === 0) setError("No path exists between these words.");
      else setPaths(result);
      setSolving(false);
    }, 0);
  };

  const clamp = (v: string) => v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, wordLength);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Word Ladder Solver</h1>
          <p className="mt-2 text-muted-foreground">
            Enter two words. Get every shortest ladder between them.
          </p>
        </header>

        <div className="mb-6 inline-flex rounded-md border bg-muted p-1">
          {MODES.map((m) => (
            <button
              key={String(m.id)}
              onClick={() => switchMode(m.id)}
              className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                mode === m.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {mode === 4 && (
            <>
              <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver</a>
              <a href="https://flipple.clevergoat.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flipple</a>
              <a href="https://poople.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Poople</a>
            </>
          )}
          {mode === 5 && (
            <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver</a>
          )}
          {mode === 6 && (
            <a href="https://onelook.com/pandergram/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pandergram</a>
          )}
          {mode === "splice" && (
            <a href="https://wordsplice.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Splice</a>
          )}
        </div>

        {mode === "splice" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Chain 5-letter words where each next word begins with the last 2 or 3 letters of the previous word.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium">Start</label>
            <Input
              value={start}
              onChange={(e) => setStart(clamp(e.target.value))}
              maxLength={wordLength}
              className="font-mono text-lg uppercase tracking-widest"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Goal</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(clamp(e.target.value))}
              maxLength={wordLength}
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
