import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useState } from "react";
import { findAllShortestPaths, formatPivotsWord, getRandomWords, isValid5LetterWord, isValidWord, marblessSolve, mastermindSolve, MODE_WORD_LENGTH, pivotsBracketRange, spellingBeeSolve, wordiplySearch, wordleSolve, type MarblessSolution, type Mode, type WordleColor } from "@/lib/wordLadder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Word Ladder Solver" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
  component: Index,
});

const SECTIONS: { id: "ladder" | "search"; label: string }[] = [
  { id: "ladder", label: "Word ladder" },
  { id: "search", label: "Word search" },
];

const LADDER_MODES: { id: string; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

const SEARCH_MODES: { id: string; label: string }[] = [
  { id: "wordle", label: "Wordle" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

const DEFAULTS: Record<string, { start: string; goal: string }> = {
  "4": { start: "DARK", goal: "POOP" },
  "5": { start: "FLOWN", goal: "BRAID" },
  "6": { start: "CRAWLS", goal: "BLAZED" },
  splice: { start: "BAGEL", goal: "TOWER" },
  weaverx: { start: "BREAK", goal: "EVEN" },
  pivots: { start: "421356", goal: "123456" },
  wordiply: { start: "TOWER", goal: "" },
  wordle: { start: "TOWER", goal: "" },
  spellingbee: { start: "T", goal: "OWERAB" },
  craftwords: { start: "BREAK", goal: "EVEN" },
  mastermind: { start: "WATER", goal: "" },
  marbless: { start: "", goal: "" },
};


function Index() {
  const [mode, setMode] = useState<Mode>(4);
  const [start, setStart] = useState("DARK");
  const [goal, setGoal] = useState("POOP");
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [wordiplyResults, setWordiplyResults] = useState<[number, string[]][] | null>(null);
  const [wordleGuesses, setWordleGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "WATER", pattern: ["GREEN", "GREEN", "YELLOW", "GREY", "GREY"] },
    { word: "ZESTY", pattern: ["YELLOW", "GREY", "GREY", "GREEN", "GREY"] },
  ]);
  const [wordleResults, setWordleResults] = useState<string[] | null>(null);
  const [spellingBeeMiddle, setSpellingBeeMiddle] = useState("T");
  const [spellingBeeOthers, setSpellingBeeOthers] = useState("OWERAB");
  const [spellingBeeResults, setSpellingBeeResults] = useState<[number, string[]][] | null>(null);
  const [mastermindRows, setMastermindRows] = useState<{ word: string; greens: number; yellows: number }[]>([
    { word: "WATER", greens: 4, yellows: 0 },
  ]);
  const [mastermindResults, setMastermindResults] = useState<string[] | null>(null);
  const [marblessColumns, setMarblessColumns] = useState<string[][]>([
    ["I", "G", "H", "Y", "R"],
    ["B", "R", "N", "D", "O"],
  ]);
  const [marblessResults, setMarblessResults] = useState<MarblessSolution[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const wordLength = MODE_WORD_LENGTH[String(mode)];

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };


  const switchMode = (m: Mode) => {
    setMode(m);
    setPaths(null);
    setWordiplyResults(null);
    setWordleResults(null);
    setSpellingBeeResults(null);
    setMastermindResults(null);
    setMarblessResults(null);
    setError(null);
    const d = DEFAULTS[String(m)];
    setStart(d.start);
    setGoal(d.goal);
  };

  const solveSpellingBee = async () => {
    setError(null);
    setSpellingBeeResults(null);
    const m = spellingBeeMiddle.toUpperCase().replace(/[^A-Z]/g, "");
    const o = spellingBeeOthers.toUpperCase().replace(/[^A-Z]/g, "");
    if (m.length !== 1) {
      setError("Middle letter must be exactly 1 letter.");
      return;
    }
    if (o.length !== 6) {
      setError("Other letters must be exactly 6 letters.");
      return;
    }
    if (new Set((m + o).split("")).size !== 7) {
      setError("All 7 letters must be distinct.");
      return;
    }
    setSolving(true);
    const result = await spellingBeeSolve(m, o);
    if (result.length === 0) setError("No words match these letters.");
    else setSpellingBeeResults(result);
    setSolving(false);
  };

  const solveMastermind = async () => {
    setError(null);
    setMastermindResults(null);
    for (let i = 0; i < mastermindRows.length; i++) {
      const row = mastermindRows[i];
      const w = row.word.trim().toUpperCase();
      if (w.length !== 5) {
        setError(`Row ${i + 1}: guess must be exactly 5 letters.`);
        return;
      }
      if (!(await isValid5LetterWord(w))) {
        setError(`Row ${i + 1}: "${w}" is not a valid 5-letter English word.`);
        return;
      }
      if (row.greens + row.yellows > 5) {
        setError(`Row ${i + 1}: GREEN + YELLOW cannot exceed 5.`);
        return;
      }
    }
    setSolving(true);
    const perRow = await Promise.all(
      mastermindRows.map((r) => mastermindSolve(r.word.toUpperCase(), r.greens, r.yellows)),
    );
    const intersection = perRow.reduce<string[]>((acc, list, idx) => {
      if (idx === 0) return list;
      const s = new Set(list);
      return acc.filter((w) => s.has(w));
    }, []);
    if (intersection.length === 0) setError("No words match these constraints.");
    else setMastermindResults(intersection);
    setSolving(false);
  };

  const setMastermindLetter = (ri: number, ti: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setMastermindRows((prev) =>
      prev.map((r, i) => {
        if (i !== ri) return r;
        const padded = r.word.padEnd(5, " ").slice(0, 5).split("");
        padded[ti] = c || " ";
        return { ...r, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };

  const focusMastermindTile = (ri: number, ti: number) => {
    if (ti < 0 || ti > 4) return;
    const el = document.getElementById(`mastermind-tile-${ri}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const addMastermindRow = () => {
    setMastermindRows((prev) => [...prev, { word: "", greens: 0, yellows: 0 }]);
  };

  const removeMastermindRow = (ri: number) => {
    setMastermindRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== ri) : prev));
  };

  const setMarblessLetter = (col: number, row: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setMarblessColumns((prev) =>
      prev.map((column, ci) =>
        ci === col ? column.map((x, ri) => (ri === row ? c : x)) : column,
      ),
    );
  };

  const focusMarblessTile = (col: number, row: number) => {
    if (col < 0 || col >= marblessColumns.length || row < 0 || row > 4) return;
    const el = document.getElementById(`marbless-tile-${col}-${row}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };


  const solveMarbless = async () => {
    setError(null);
    setMarblessResults(null);
    for (let c = 0; c < marblessColumns.length; c++) {
      for (let r = 0; r < 5; r++) {
        if (!marblessColumns[c][r] || !/^[A-Z]$/.test(marblessColumns[c][r])) {
          setError(`Column ${c + 1}, row ${r + 1}: please enter a letter.`);
          return;
        }
      }
    }
    setSolving(true);
    const result = await marblessSolve(marblessColumns);
    if (result.length === 0) setError("No valid word sequences found.");
    else setMarblessResults(result);
    setSolving(false);
  };




  const solveWordle = async () => {
    setError(null);
    setWordleResults(null);
    for (const g of wordleGuesses) {
      const w = g.word.trim().toUpperCase();
      if (w.length !== 5) {
        setError("Each guess must be exactly 5 letters.");
        return;
      }
      if (!(await isValid5LetterWord(w))) {
        setError(`"${w}" is not a valid 5-letter English word.`);
        return;
      }
    }
    setSolving(true);
    const normalized = wordleGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    const result = await wordleSolve(normalized);
    if (result.length === 0) setError("No words match these constraints.");
    else setWordleResults(result);
    setSolving(false);
  };

  const cycleTile = (gi: number, ti: number) => {
    setWordleGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
        const next = [...g.pattern];
        next[ti] = order[(order.indexOf(g.pattern[ti]) + 1) % 3];
        return { ...g, pattern: next };
      }),
    );
  };

  const setGuessLetter = (gi: number, ti: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setWordleGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const padded = g.word.padEnd(5, " ").slice(0, 5).split("");
        padded[ti] = c || " ";
        return { ...g, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };

  const focusTile = (gi: number, ti: number) => {
    if (ti < 0 || ti > 4) return;
    const el = document.getElementById(`wordle-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const addGuessRow = () => {
    setWordleGuesses((prev) => [...prev, { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
  };

  const removeGuessRow = (gi: number) => {
    setWordleGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
  };

  const solve = () => {
    setError(null);
    setPaths(null);
    setWordiplyResults(null);
    const s = start.trim().toUpperCase();

    if (mode === "wordiply") {
      if (s.length < 1) {
        setError("Please enter a substring.");
        return;
      }
      setSolving(true);
      wordiplySearch(s).then((result) => {
        if (result.length === 0) setError(`No English words contain "${s}".`);
        else setWordiplyResults(result);
        setSolving(false);
      });
      return;
    }

    const g = goal.trim().toUpperCase();
    if (wordLength > 0 && (s.length !== wordLength || g.length !== wordLength)) {
      setError(`Both words must be exactly ${wordLength} letters.`);
      return;
    }
    if (wordLength === 0 && (s.length < 2 || g.length < 2)) {
      setError(`Please enter valid words.`);
      return;
    }
    if (!isValidWord(s, mode)) return setError(`"${s}" is not in the dictionary.`);
    if (!isValidWord(g, mode)) return setError(`"${g}" is not in the dictionary.`);
    setSolving(true);
    setTimeout(() => {
      const result = findAllShortestPaths(s, g, mode);
      if (result.length === 0) setError(mode === "pivots" ? "No path exists for this starting position." : "No path exists between these words.");
      else setPaths(result);
      setSolving(false);
    }, 0);
  };

  const randomize = () => {
    setError(null);
    setPaths(null);
    setWordiplyResults(null);
    if (mode === "pivots") {
      const [w1] = getRandomWords(mode);
      setStart(w1);
    } else if (mode === "wordiply") {
      const [w1] = getRandomWords(5);
      setStart(w1);
    } else {
      const [w1, w2] = getRandomWords(mode);
      setStart(w1);
      setGoal(w2);
    }
  };

  const clamp = (v: string) => {
    if (mode === "pivots") return v.replace(/[^1-6]/g, "").slice(0, 6);
    const cleaned = v.toUpperCase().replace(/[^A-Z]/g, "");
    return wordLength > 0 ? cleaned.slice(0, wordLength) : cleaned.slice(0, 12);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Word Ladder Solver</h1>
            <p className="mt-2 text-muted-foreground">
              Enter two words. Get every shortest ladder between them.
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="shrink-0 rounded-md border bg-muted p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="mb-3 inline-flex rounded-md border bg-muted p-1">
          {SECTIONS.map((s) => {
            const inSearch = mode === "wordle" || mode === "spellingbee" || mode === "mastermind" || mode === "marbless";
            const isActive = s.id === "search" ? inSearch : !inSearch;
            return (
              <button
                key={s.id}
                onClick={() => s.id === "ladder" ? switchMode(4) : switchMode("wordle")}
                className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {mode !== "wordle" && mode !== "spellingbee" && mode !== "mastermind" && mode !== "marbless" && (
          <div className="mb-6 inline-flex rounded-md border bg-muted p-1 sm:ml-2">
            {LADDER_MODES.map((m) => {
              const isActive =
                m.id === "classic"
                  ? mode === 4 || mode === 5 || mode === 6
                  : mode === "splice" || mode === "weaverx" || mode === "pivots" || mode === "wordiply" || mode === "craftwords";

              return (
                <button
                  key={m.id}
                  onClick={() => m.id === "classic" ? switchMode(4) : switchMode("splice")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        )}

        {(mode === "wordle" || mode === "spellingbee" || mode === "mastermind" || mode === "marbless") && (
          <div className="mb-4 flex flex-col rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("wordle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wordle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wordle
            </button>
            <button
              onClick={() => switchMode("spellingbee")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "spellingbee"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Spelling Bee
            </button>
            <button
              onClick={() => switchMode("mastermind")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "mastermind"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mastermind
            </button>
            <button
              onClick={() => switchMode("marbless")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "marbless"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Marbless
            </button>
          </div>
        )}


        {(mode === 4 || mode === 5 || mode === 6) && (
          <div className="mb-4 flex flex-col rounded-md border bg-muted p-1">
            {([4, 5, 6] as const).map((n) => (
              <button
                key={n}
                onClick={() => switchMode(n)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  mode === n
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n} letters
              </button>
            ))}
          </div>
        )}


        {(mode === "splice" || mode === "weaverx" || mode === "pivots" || mode === "wordiply" || mode === "craftwords") && (
          <div className="mb-4 flex flex-col rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("splice")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "splice"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Word Splice
            </button>
            <button
              onClick={() => switchMode("weaverx")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "weaverx"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weaver X
            </button>
            <button
              onClick={() => switchMode("craftwords")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "craftwords"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Craft Words
            </button>
            <button
              onClick={() => switchMode("pivots")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "pivots"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PlayPivots
            </button>
            <button
              onClick={() => switchMode("wordiply")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wordiply"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wordiply
            </button>
          </div>
        )}

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
          {mode === "splice" && (
            <a href="https://wordsplice.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Splice</a>
          )}
          
          {mode === "weaverx" && (
            <a href="https://wordwormdormdork.com/weaver-x/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver X</a>
          )}
          {mode === "pivots" && (
            <a href="https://playpivots.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PlayPivots</a>
          )}
          {mode === "wordiply" && (
            <a href="https://www.wordiply.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordiply</a>
          )}
          {mode === "wordle" && (
            <>
              <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordle</a>
              <a href="https://bushong.net/~mconst/wordinone/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordle in one</a>
              <a href="https://wordlein2.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordle in two</a>
              <a href="https://cludl.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cludl</a>
              <a href="https://wordall.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word all</a>
            </>
          )}
          {mode === "spellingbee" && (
            <a href="https://www.nytimes.com/puzzles/spelling-bee" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Spelling Bee</a>
          )}
          {mode === "craftwords" && (
            <a href="https://craftword.game/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Craft Words</a>
          )}
          {mode === "mastermind" && (
            <>
              <a href="https://word500.com/game?mode=daily" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word500</a>
              <a href="https://play.woodle.today/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Woodle</a>
            </>
          )}
          {mode === "marbless" && (
            <a href="https://marbless.co/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Marbless</a>
          )}
        </div>

        {mode === "craftwords" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Each move: replace one letter, add one letter, remove one letter, or permute the letters. Word lengths may vary.
          </p>
        )}

        {mode === "splice" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Chain 5-letter words where each next word begins with the last 2 or 3 letters of the previous word.
          </p>
        )}

        {mode === "weaverx" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Each move: change one letter, add one letter, or remove one letter. Word lengths may vary.
          </p>
        )}

        {mode === "pivots" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a permutation of "123456". Each move reverses 4 consecutive digits. Goal is "123456".
          </p>
        )}

        {mode === "wordiply" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a substring. Find all English words containing it, grouped by the number of extra letters.
          </p>
        )}

        {mode === "wordle" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your guesses and click each tile to cycle GREY → YELLOW → GREEN. Get all 5-letter words consistent with the feedback.
          </p>
        )}

        {mode === "spellingbee" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter the middle letter and the 6 outer letters. Find all valid 4+ letter words using only these 7 letters that include the middle letter, grouped by score.
          </p>
        )}

        {mode === "mastermind" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a 5-letter guess and the totals of GREEN (correct placements) and YELLOW (wrong placements). Find all 5-letter words consistent with those totals.
          </p>
        )}

        {mode === "marbless" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Set up 2 to 4 columns of 5 letters each. Each move removes the top (leftmost) letter from any column. Find all orderings that spell valid 5-letter English words.
          </p>
        )}

        {mode === "wordle" ? (
          <div className="space-y-4">
            {wordleGuesses.map((g, gi) => (
              <div key={gi} className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, ti) => {
                    const letter = g.word[ti] && g.word[ti] !== " " ? g.word[ti] : "";
                    const color = g.pattern[ti];
                    const colorClass =
                      color === "GREEN"
                        ? "bg-green-600 text-white border-green-600 caret-white"
                        : color === "YELLOW"
                          ? "bg-yellow-500 text-white border-yellow-500 caret-white"
                          : "bg-muted text-foreground border-border caret-foreground";
                    return (
                      <input
                        key={ti}
                        id={`wordle-tile-${gi}-${ti}`}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        value={letter}
                        aria-label={`Guess ${gi + 1} tile ${ti + 1}: ${color}`}
                        onMouseDown={(e) => {
                          if (document.activeElement === e.currentTarget) {
                            e.preventDefault();
                            cycleTile(gi, ti);
                          }
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                          if (!v) {
                            setGuessLetter(gi, ti, "");
                            return;
                          }
                          setGuessLetter(gi, ti, v.slice(-1));
                          if (ti < 4) focusTile(gi, ti + 1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            if (!letter && ti > 0) {
                              e.preventDefault();
                              focusTile(gi, ti - 1);
                            }
                          } else if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            focusTile(gi, ti - 1);
                          } else if (e.key === "ArrowRight") {
                            e.preventDefault();
                            focusTile(gi, ti + 1);
                          } else if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            cycleTile(gi, ti);
                          }
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded border-2 text-center font-mono text-xl font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${colorClass}`}
                      />
                    );
                  })}
                </div>
                {wordleGuesses.length > 1 && (
                  <Button onClick={() => removeGuessRow(gi)} variant="outline" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addGuessRow} variant="outline" size="lg">
                Add guess
              </Button>
              <Button
                onClick={() => {
                  setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                  setWordleResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button onClick={solveWordle} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "spellingbee" ? (
          <div className="grid gap-4 sm:items-end sm:grid-cols-[auto_1fr_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium">Middle letter</label>
              <Input
                value={spellingBeeMiddle}
                onChange={(e) => setSpellingBeeMiddle(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1))}
                maxLength={1}
                className="w-16 font-mono text-lg uppercase tracking-widest"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Other 6 letters</label>
              <Input
                value={spellingBeeOthers}
                onChange={(e) => setSpellingBeeOthers(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6))}
                maxLength={6}
                className="font-mono text-lg uppercase tracking-widest"
              />
            </div>
            <Button onClick={solveSpellingBee} disabled={solving} size="lg">
              {solving ? "Solving..." : "Solve"}
            </Button>
          </div>
        ) : mode === "mastermind" ? (
          <div className="space-y-4">
            {mastermindRows.map((row, ri) => (
              <div key={ri} className="flex flex-wrap items-end gap-3">
                <div>
                  {ri === 0 && <label className="mb-1 block text-sm font-medium">Guess</label>}
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, ti) => {
                      const letter = row.word[ti] && row.word[ti] !== " " ? row.word[ti] : "";
                      return (
                        <input
                          key={ti}
                          id={`mastermind-tile-${ri}-${ti}`}
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          value={letter}
                          aria-label={`Row ${ri + 1} tile ${ti + 1}`}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                            if (!v) {
                              setMastermindLetter(ri, ti, "");
                              return;
                            }
                            setMastermindLetter(ri, ti, v.slice(-1));
                            if (ti < 4) focusMastermindTile(ri, ti + 1);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              if (!letter && ti > 0) {
                                e.preventDefault();
                                focusMastermindTile(ri, ti - 1);
                              }
                            } else if (e.key === "ArrowLeft") {
                              e.preventDefault();
                              focusMastermindTile(ri, ti - 1);
                            } else if (e.key === "ArrowRight") {
                              e.preventDefault();
                              focusMastermindTile(ri, ti + 1);
                            }
                          }}
                          className="flex h-12 w-12 items-center justify-center rounded border-2 border-border bg-muted text-center font-mono text-xl font-bold uppercase text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                        />
                      );
                    })}
                  </div>
                </div>
                <div>
                  {ri === 0 && <label className="mb-1 block text-sm font-medium">GREEN</label>}
                  <select
                    value={row.greens}
                    onChange={(e) =>
                      setMastermindRows((prev) =>
                        prev.map((r, i) => (i === ri ? { ...r, greens: Number(e.target.value) } : r)),
                      )
                    }
                    className="h-12 w-20 rounded border-2 border-green-600 bg-green-600 px-2 text-center font-mono text-lg font-bold text-white outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n} className="bg-background text-foreground">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  {ri === 0 && <label className="mb-1 block text-sm font-medium">YELLOW</label>}
                  <select
                    value={row.yellows}
                    onChange={(e) =>
                      setMastermindRows((prev) =>
                        prev.map((r, i) => (i === ri ? { ...r, yellows: Number(e.target.value) } : r)),
                      )
                    }
                    className="h-12 w-20 rounded border-2 border-yellow-500 bg-yellow-500 px-2 text-center font-mono text-lg font-bold text-white outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n} className="bg-background text-foreground">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                {mastermindRows.length > 1 && (
                  <Button onClick={() => removeMastermindRow(ri)} variant="outline" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addMastermindRow} variant="outline" size="lg">
                Add guess
              </Button>
              <Button
                onClick={() => {
                  setMastermindRows([{ word: "", greens: 0, yellows: 0 }]);
                  setMastermindResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button onClick={solveMastermind} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "marbless" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Number of columns:</label>
              <select
                value={marblessColumns.length}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setMarblessColumns((prev) => {
                    if (n === prev.length) return prev;
                    if (n > prev.length) {
                      const add = Array.from({ length: n - prev.length }, () => ["", "", "", "", ""]);
                      return [...prev, ...add];
                    }
                    return prev.slice(0, n);
                  });
                }}
                className="h-9 rounded border border-input bg-background px-2 text-sm"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div className="flex gap-3">
              {marblessColumns.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5">
                  <div className="mb-1 text-center text-xs font-medium text-muted-foreground">
                    Col {ci + 1}
                  </div>
                  {[4, 3, 2, 1, 0].map((ri) => {
                    const letter = col[ri];
                    return (
                    <input
                      key={ri}
                      id={`marbless-tile-${ci}-${ri}`}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={letter}
                      aria-label={`Column ${ci + 1} position ${ri + 1} from bottom`}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                        if (!v) {
                          setMarblessLetter(ci, ri, "");
                          return;
                        }
                        setMarblessLetter(ci, ri, v.slice(-1));
                        if (ri < 4) focusMarblessTile(ci, ri + 1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          if (!letter && ri < 4) {
                            e.preventDefault();
                            focusMarblessTile(ci, ri + 1);
                          }
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          focusMarblessTile(ci, ri + 1);
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          focusMarblessTile(ci, ri - 1);
                        } else if (e.key === "ArrowLeft") {
                          e.preventDefault();
                          focusMarblessTile(ci - 1, ri);
                        } else if (e.key === "ArrowRight") {
                          e.preventDefault();
                          focusMarblessTile(ci + 1, ri);
                        }
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded border-2 border-border bg-muted text-center font-mono text-xl font-bold uppercase text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                    />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={solveMarbless} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>

        ) : (
          <div
            className={`grid gap-4 sm:items-end ${
              mode === "wordiply"
                ? "sm:grid-cols-[1fr_auto_auto]"
                : "sm:grid-cols-[1fr_1fr_auto_auto]"
            }`}
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                {mode === "wordiply" ? "Substring" : "Start"}
              </label>
              <Input
                value={start}
                onChange={(e) => setStart(clamp(e.target.value))}
                maxLength={wordLength || 12}
                className="font-mono text-lg uppercase tracking-widest"
              />
            </div>
            {mode !== "wordiply" && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Goal{mode === "pivots" ? " (fixed)" : ""}
                </label>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(clamp(e.target.value))}
                  maxLength={wordLength || 12}
                  disabled={mode === "pivots"}
                  className="font-mono text-lg uppercase tracking-widest"
                />
              </div>
            )}
            <Button onClick={randomize} variant="outline" size="lg">
              Randomize
            </Button>
            <Button onClick={solve} disabled={solving} size="lg">
              {solving ? "Solving..." : "Solve"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {paths && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {paths.length} optimal {paths.length === 1 ? "path" : "paths"} · {paths[0].length - 1} steps
              </h2>
              <button
                onClick={() => {
                  const items = paths.map((p, i) => {
                    if (mode === "pivots") {
                      const formatted = p.map((w, j) => {
                        if (j === 0) return w;
                        return formatPivotsWord(w, pivotsBracketRange(p[j - 1], w));
                      });
                      return `${i + 1}. ${formatted.join(" > ")}`;
                    }
                    return `${i + 1}. ${p.join(" > ")}`;
                  }).join("\n");
                  copyText(`${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all paths"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <ol className="space-y-3">
              {paths.map((path, i) => (
                <li
                  key={i}
                  className="flex items-center rounded-lg border bg-card p-4 font-mono text-card-foreground"
                >
                  <div className="flex-1">
                    <span className="mr-3 text-xs text-muted-foreground">#{i + 1}</span>
                    {path.map((w, j) => {
                      const display = mode === "pivots" && j > 0
                        ? formatPivotsWord(w, pivotsBracketRange(path[j - 1], w))
                        : w;
                      return (
                        <span key={j} className="inline-block whitespace-nowrap">
                          <span className="font-semibold tracking-widest">{display}</span>
                          {j < path.length - 1 && (
                            <span className="mx-2 text-muted-foreground">→</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {wordiplyResults && (() => {
          const reversed = [...wordiplyResults].reverse();
          const flat: string[] = [];
          for (const [, ws] of reversed) {
            for (const w of ws) {
              flat.push(w);
              if (flat.length >= 5) break;
            }
            if (flat.length >= 5) break;
          }
          const M = flat.reduce((n, w) => n + w.length, 0);
          return (
          <section className="mt-10">
            <div className="mb-2 text-base font-semibold">
              Total letter score obtainable is {M}.
            </div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {wordiplyResults.reduce((n, [, ws]) => n + ws.length, 0)} words containing "{start.toUpperCase()}"
              </h2>
              <button
                onClick={() => {
                  const items = reversed
                    .map(([extra, words], i) => `${i + 1}. +${extra} extra ${extra === 1 ? "letter" : "letters"}: ${words.join(", ")}`)
                    .join("\n");
                  copyText(`Total letter score obtainable is ${M}.\n\n${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all words"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="space-y-4">
              {reversed.map(([extra, words]) => (
                <div key={extra} className="rounded-lg border bg-card p-4">
                  <div className="mb-2 text-sm font-semibold text-muted-foreground">
                    +{extra} extra {extra === 1 ? "letter" : "letters"} · {words.length} {words.length === 1 ? "word" : "words"}
                  </div>
                  <div className="flex flex-wrap gap-2 font-mono text-sm">
                    {words.map((w) => (
                      <a
                        key={w}
                        href={`https://www.dictionary.com/browse/${w.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                      >
                        {w}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          );
        })()}

        {wordleResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {wordleResults.length} possible {wordleResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${wordleResults.length} possible ${wordleResults.length === 1 ? "answer" : "answers"}:\n${wordleResults.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {wordleResults.map((w) => (
                  <a
                    key={w}
                    href={`https://www.dictionary.com/browse/${w.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {spellingBeeResults && (() => {
          const totalWords = spellingBeeResults.reduce((n, [, ws]) => n + ws.length, 0);
          const totalScore = spellingBeeResults.reduce((n, [score, ws]) => n + score * ws.length, 0);
          return (
            <section className="mt-10">
              <div className="mb-2 text-base font-semibold">
                Total score obtainable is {totalScore}.
              </div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {totalWords} {totalWords === 1 ? "word" : "words"}
                </h2>
                <button
                  onClick={() => {
                    const items = spellingBeeResults
                      .map(([score, words], i) => `${i + 1}. ${score} ${score === 1 ? "point" : "points"}: ${words.join(", ")}`)
                      .join("\n");
                    copyText(`Total score obtainable is ${totalScore}.\n\n${items}\n\nSolved via ${window.location.href}.`);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  aria-label="Copy all words"
                >
                  {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                </button>
              </div>
              <div className="space-y-4">
                {spellingBeeResults.map(([score, words]) => (
                  <div key={score} className="rounded-lg border bg-card p-4">
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      {score} {score === 1 ? "point" : "points"} · {words.length} {words.length === 1 ? "word" : "words"}
                    </div>
                    <div className="flex flex-wrap gap-2 font-mono text-sm">
                      {words.map((w) => (
                        <a
                          key={w}
                          href={`https://www.dictionary.com/browse/${w.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                        >
                          {w}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {mastermindResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {mastermindResults.length} possible {mastermindResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${mastermindResults.length} possible ${mastermindResults.length === 1 ? "answer" : "answers"}:\n${mastermindResults.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {mastermindResults.map((w) => (
                  <a
                    key={w}
                    href={`https://www.dictionary.com/browse/${w.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {marblessResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {marblessResults.length} {marblessResults.length === 1 ? "solution" : "solutions"}
              </h2>
              <button
                onClick={() => {
                  const items = marblessResults
                    .map((s, i) => `${i + 1}. ${s.words.join(" ")} · moves: ${s.moves.join(",")}`)
                    .join("\n");
                  copyText(`${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all solutions"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <ol className="space-y-4">
              {marblessResults.map((sol, i) => (
                <li key={i} className="rounded-lg border bg-card p-4 text-card-foreground">
                  <div className="mb-2 text-xs text-muted-foreground">#{i + 1}</div>
                  <table className="w-full border-collapse font-mono text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="border-r px-3 py-2 text-left font-semibold">Word</th>
                        <th className="px-3 py-2 text-left font-semibold">Moves</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sol.words.map((w, wi) => (
                        <tr key={wi} className="border-b last:border-b-0">
                          <td className="border-r px-3 py-2 font-semibold tracking-widest">{w}</td>
                          <td className="px-3 py-2">{sol.moves.slice(wi * 5, wi * 5 + 5).join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </li>
              ))}
            </ol>

          </section>
        )}

      </div>

    </div>
  );
}
