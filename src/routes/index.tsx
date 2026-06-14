import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useState } from "react";
import { dodekuSolve, findAllShortestPaths, flippingLettersSolve, formatPivotsWord, getRandomWords, isValid5LetterWord, isValidWord, marblessSolve, mastermindSolve, MODE_WORD_LENGTH, pivotsBracketRange, spellingBeeSolve, wordiplySearch, wordleSolve, wordPeaksSolve, worwordleSolve, worwordleSplit, type DodekuCell, type MarblessSolution, type Mode, type WordleColor, type WordPeaksDirection } from "@/lib/wordLadder";
import wordleStartingWords from "@/data/wordleStartingWords.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solve Stack" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
  component: Index,
});

const SECTIONS: { id: "ladder" | "search" | "math"; label: string }[] = [
  { id: "search", label: "Word search" },
  { id: "ladder", label: "Word ladder" },
  { id: "math", label: "Mathematics" },
];

const LADDER_MODES: { id: string; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

const SEARCH_MODES: { id: string; label: string }[] = [
  { id: "wordle", label: "Wordle" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

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
  dodeku: { start: "", goal: "" },
  wordpeaks: { start: "PEDAL", goal: "" },
  flippingletters: { start: "", goal: "" },
  worwordle: { start: "", goal: "" },

};

const FL_FLIP_MAP: Record<string, string> = {
  A: "E", E: "A", D: "P", P: "D", N: "U", U: "N", M: "W", W: "M",
};


function Paginator({ page, setPage, total, perPage = 50 }: { page: number; setPage: (n: number) => void; total: number; perPage?: number }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))}>Prev</Button>
      <span>Page {page + 1} of {pages}</span>
      <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(Math.min(pages - 1, page + 1))}>Next</Button>
    </div>
  );
}

function sliceGroups(groups: [number, string[]][], page: number, perPage = 50): [number, string[]][] {
  const start = page * perPage;
  const end = start + perPage;
  const out: [number, string[]][] = [];
  let idx = 0;
  for (const [k, words] of groups) {
    const gStart = idx;
    const gEnd = idx + words.length;
    if (gEnd > start && gStart < end) {
      const s = Math.max(start, gStart) - gStart;
      const e = Math.min(end, gEnd) - gStart;
      out.push([k, words.slice(s, e)]);
    }
    idx = gEnd;
  }
  return out;
}

function Index() {
  const [mode, setMode] = useState<Mode>("wordle");
  const [start, setStart] = useState("TOWER");
  const [goal, setGoal] = useState("");
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [wordiplyResults, setWordiplyResults] = useState<[number, string[]][] | null>(null);
  const [wordleGuesses, setWordleGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "SLATE", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [wordleResults, setWordleResults] = useState<string[] | null>(null);
  const [spellingBeeMiddle, setSpellingBeeMiddle] = useState("T");
  const [spellingBeeOthers, setSpellingBeeOthers] = useState("OWERAB");
  const [spellingBeeResults, setSpellingBeeResults] = useState<[number, string[]][] | null>(null);
  const [mastermindRows, setMastermindRows] = useState<{ word: string; greens: number; yellows: number }[]>([
    { word: "WATER", greens: 4, yellows: 0 },
  ]);
  const [mastermindResults, setMastermindResults] = useState<string[] | null>(null);
  const [wordPeaksGuesses, setWordPeaksGuesses] = useState<{ word: string; pattern: WordPeaksDirection[] }[]>([
    { word: "ONION", pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] },
  ]);
  const [wordPeaksResults, setWordPeaksResults] = useState<string[] | null>(null);

  const [flLetters, setFlLetters] = useState<string[]>(["C","I","K","T","S","L","N","A","H","V"]);
  const [flRevealed, setFlRevealed] = useState<boolean[]>(Array(10).fill(false));
  const [flGuesses, setFlGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [flResults, setFlResults] = useState<{ flippable: string[]; answers: string[] } | null>(null);
  const [pageFl, setPageFl] = useState(0);

  const [worGuesses, setWorGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [worResults, setWorResults] = useState<string[] | null>(null);
  const [pageWor, setPageWor] = useState(0);

  const [marblessColumns, setMarblessColumns] = useState<string[][]>([
    ["I", "G", "H", "Y", "R"],
    ["B", "R", "N", "D", "O"],
  ]);
  const [marblessResults, setMarblessResults] = useState<MarblessSolution[] | null>(null);
  const [dodekuGrid, setDodekuGrid] = useState<string[][]>([
    ["X", "X", "X", ""],
    ["X", "", "", ""],
    ["", "", "", "11"],
    ["", "4", "1", ""],
  ]);
  const [dodekuRowSums, setDodekuRowSums] = useState<string[]>(["5", "20", "35", ""]);
  const [dodekuColSums, setDodekuColSums] = useState<string[]>(["8", "", "21", "32"]);
  const [dodekuTiles, setDodekuTiles] = useState<string>("2,3,5,6,7,8,9,10,12");
  const [dodekuResult, setDodekuResult] = useState<DodekuCell[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(true);
  const [showWordleVariations, setShowWordleVariations] = useState(false);
  const [pagePaths, setPagePaths] = useState(0);
  const [pageWordle, setPageWordle] = useState(0);
  const [pageMM, setPageMM] = useState(0);
  const [pageWP, setPageWP] = useState(0);

  const [pageMarbless, setPageMarbless] = useState(0);
  const [pageWordiply, setPageWordiply] = useState(0);
  const [pageBee, setPageBee] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => { setPagePaths(0); }, [paths]);
  useEffect(() => { setPageWordle(0); }, [wordleResults]);
  useEffect(() => { setPageMM(0); }, [mastermindResults]);
  useEffect(() => { setPageWP(0); }, [wordPeaksResults]);

  useEffect(() => { setPageMarbless(0); }, [marblessResults]);
  useEffect(() => { setPageWordiply(0); }, [wordiplyResults]);
  useEffect(() => { setPageBee(0); }, [spellingBeeResults]);
  useEffect(() => { setPageFl(0); }, [flResults]);
  useEffect(() => { setPageWor(0); }, [worResults]);

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
    setWordPeaksResults(null);
    setFlResults(null);
    setWorResults(null);

    setMarblessResults(null);
    setDodekuResult(null);
    setError(null);
    const d = DEFAULTS[String(m)];
    setStart(d.start);
    setGoal(d.goal);
  };

  const solveDodeku = () => {
    setError(null);
    setDodekuResult(null);
    const initial: DodekuCell[][] = dodekuGrid.map((row) =>
      row.map<DodekuCell>((v) => {
        const s = v.trim();
        if (s === "X" || s === "x") return "X";
        if (s === "" || s === "0") return 0;
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : 0;
      }),
    );
    const rs = dodekuRowSums.map((s) => (s.trim() === "" ? null : parseInt(s, 10)));
    const cs = dodekuColSums.map((s) => (s.trim() === "" ? null : parseInt(s, 10)));
    const tiles = dodekuTiles
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((t) => parseInt(t, 10))
      .filter((n) => Number.isFinite(n));
    const emptyCount = initial.flat().filter((v) => v === 0).length;
    if (tiles.length !== emptyCount) {
      setError(`Number of tiles (${tiles.length}) must equal number of empty cells (${emptyCount}).`);
      return;
    }
    setSolving(true);
    setTimeout(() => {
      const res = dodekuSolve(initial, rs, cs, tiles);
      if (!res) setError("No solution found.");
      else setDodekuResult(res);
      setSolving(false);
    }, 0);
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

  const solveWordPeaks = async () => {
    setError(null);
    setWordPeaksResults(null);
    for (const g of wordPeaksGuesses) {
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
    for (const g of wordPeaksGuesses) {
      if (g.pattern.some((p) => p === "NONE")) {
        setError("Please set a shape for every tile (hollow yellow squares are not allowed).");
        return;
      }
    }
    setSolving(true);
    const normalized = wordPeaksGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    const result = await wordPeaksSolve(normalized);
    if (result.length === 0) setError("No words match these constraints.");
    else setWordPeaksResults(result);
    setSolving(false);
  };

  const cycleWPTile = (gi: number, ti: number) => {
    setWordPeaksGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const order: WordPeaksDirection[] = ["NONE", "CORRECT", "BEFORE", "AFTER"];
        const next = [...g.pattern];
        next[ti] = order[(order.indexOf(g.pattern[ti]) + 1) % order.length];
        return { ...g, pattern: next };
      }),
    );
  };

  const setWPLetter = (gi: number, ti: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setWordPeaksGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const padded = g.word.padEnd(5, " ").slice(0, 5).split("");
        padded[ti] = c || " ";
        return { ...g, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };

  const focusWPTile = (gi: number, ti: number) => {
    if (ti < 0 || ti > 4) return;
    const el = document.getElementById(`wp-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const addWPRow = () => {
    setWordPeaksGuesses((prev) => [...prev, { word: "", pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] }]);
  };

  const removeWPRow = (gi: number) => {
    setWordPeaksGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
  };

  const cycleFlTile = (gi: number, ti: number) => {
    setFlGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
        const next = [...g.pattern];
        next[ti] = order[(order.indexOf(g.pattern[ti]) + 1) % 3];
        return { ...g, pattern: next };
      }),
    );
  };
  const setFlLetter = (gi: number, ti: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setFlGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const padded = g.word.padEnd(5, " ").slice(0, 5).split("");
        padded[ti] = c || " ";
        return { ...g, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };
  const focusFlTile = (gi: number, ti: number) => {
    if (ti < 0 || ti > 4) return;
    const el = document.getElementById(`fl-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };
  const addFlRow = () => {
    setFlGuesses((prev) => [...prev, { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
  };
  const removeFlRow = (gi: number) => {
    setFlGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
  };

  const solveFlippingLetters = async () => {
    setError(null);
    setFlResults(null);
    const letters = flLetters.map((l) => l.trim().toUpperCase()).filter(Boolean);
    if (letters.length !== 10) {
      setError("Please enter all 10 letters.");
      return;
    }
    if (new Set(letters).size !== 10) {
      setError("The 10 letters must be distinct.");
      return;
    }
    const flips = letters.map((l) => FL_FLIP_MAP[l] || "");
    const allowed = [...letters, ...flips.filter(Boolean)];
    for (const g of flGuesses) {
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
    const normalized = flGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    const result = await flippingLettersSolve(allowed, normalized);
    if (result.answers.length === 0) setError("No words match these constraints.");
    setFlResults(result);
    setSolving(false);
  };

  const cycleWorTile = (gi: number, ti: number) => {
    setWorGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
        const next = [...g.pattern];
        next[ti] = order[(order.indexOf(g.pattern[ti]) + 1) % 3];
        return { ...g, pattern: next };
      }),
    );
  };
  const setWorLetter = (gi: number, ti: number, ch: string) => {
    const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setWorGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const padded = g.word.padEnd(8, " ").slice(0, 8).split("");
        padded[ti] = c || " ";
        return { ...g, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };
  const focusWorTile = (gi: number, ti: number) => {
    if (ti < 0 || ti > 7) return;
    const el = document.getElementById(`wor-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };
  const addWorRow = () => {
    setWorGuesses((prev) => [...prev, { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] }]);
  };
  const removeWorRow = (gi: number) => {
    setWorGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
  };
  const solveWorwordle = async () => {
    setError(null);
    setWorResults(null);
    for (const g of worGuesses) {
      const w = g.word.trim().toUpperCase();
      if (w.length !== 8) {
        setError("Each guess must be exactly 8 letters.");
        return;
      }
    }
    setSolving(true);
    const normalized = worGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    const result = await worwordleSolve(normalized);
    if (result.length === 0) setError("No words match these constraints.");
    else setWorResults(result);
    setSolving(false);
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
            <h1 className="text-4xl font-bold tracking-tight">Solve Stack</h1>
            <p className="mt-2 text-muted-foreground">
              Building solvers, one puzzle at a time.
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

        <div className="mb-3 flex w-fit rounded-md border bg-muted p-1">
          {SECTIONS.map((s) => {
            const isMath = mode === "dodeku";
            const inSearch = mode === "wordle" || mode === "spellingbee" || mode === "mastermind" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle";
            const inLadder = !isMath && !inSearch;
            const isActive = s.id === "math" ? isMath : s.id === "search" ? inSearch : inLadder;
            return (
              <button
                key={s.id}
                onClick={() =>
                  s.id === "ladder"
                    ? switchMode(4)
                    : s.id === "search"
                      ? switchMode("wordle")
                      : switchMode("dodeku")
                }
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

        {(mode === 4 || mode === 5 || mode === 6 || mode === "splice" || mode === "weaverx" || mode === "pivots" || mode === "craftwords") && (
          <div className="mb-6 flex w-fit rounded-md border bg-muted p-1">
            {LADDER_MODES.map((m) => {
              const isActive =
                m.id === "classic"
                  ? mode === 4 || mode === 5 || mode === 6
                  : mode === "splice" || mode === "weaverx" || mode === "pivots" || mode === "craftwords";
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

        {(mode === "wordle" || mode === "mastermind" || mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle") && (
          <div className="mb-6 flex w-fit rounded-md border bg-muted p-1">
            {SEARCH_MODES.map((m) => {
              const isActive =
                m.id === "wordle"
                  ? mode === "wordle" || mode === "flippingletters" || mode === "worwordle"
                  : mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "mastermind";

              return (
                <button
                  key={m.id}
                  onClick={() => m.id === "wordle" ? switchMode("wordle") : switchMode("spellingbee")}
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

        {(mode === "wordle" || mode === "flippingletters" || mode === "worwordle") && (
          <div className="mb-4 flex flex-col rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("wordle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wordle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => switchMode("flippingletters")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "flippingletters"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Flipping Letters
            </button>
            <button
              onClick={() => switchMode("worwordle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "worwordle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Worwordle
            </button>
          </div>
        )}

        {(mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "mastermind") && (
          <div className="mb-4 flex flex-col rounded-md border bg-muted p-1">
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
              onClick={() => switchMode("marbless")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "marbless"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Marbless
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
            <button
              onClick={() => switchMode("wordpeaks")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wordpeaks"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Word Peaks
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


        {(mode === "splice" || mode === "weaverx" || mode === "pivots" || mode === "craftwords") && (
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
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {mode === 4 && (
            <>
              <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver</a>
              <span> · </span>
              <a href="https://flipple.clevergoat.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flipple</a>
              <span> · </span>
              <a href="https://poople.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Poople</a>
              <span> · </span>
              <a href="https://wordchains.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Chains</a>
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
            <div className="flex flex-col gap-2">
              <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordle</a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWordleVariations((v) => !v)}
                className="w-fit gap-1"
              >
                {showWordleVariations ? (
                  <>See less variations <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>See more variations <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
              {showWordleVariations && (
                <table className="text-sm border border-border border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-border px-3 py-1.5 text-muted-foreground whitespace-nowrap align-top">Multiple</td>
                      <td className="border border-border px-3 py-1.5">
                        <a href="https://zaratustra.itch.io/dordle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dordle</a>
                        <span> · </span>
                        <a href="https://www.quordle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Quordle</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-1.5 text-muted-foreground whitespace-nowrap align-top">One unique solution</td>
                      <td className="border border-border px-3 py-1.5">
                        <a href="https://bushong.net/~mconst/wordinone/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word-in-one</a>
                        <span> · </span>
                        <a href="https://wordlein2.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word-in-two</a>
                        <span> · </span>
                        <a href="https://cludl.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cludl</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-1.5 text-muted-foreground whitespace-nowrap align-top">Find all solutions</td>
                      <td className="border border-border px-3 py-1.5">
                        <a href="https://wordall.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word All</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-1.5 text-muted-foreground whitespace-nowrap align-top">Goes on forever</td>
                      <td className="border border-border px-3 py-1.5">
                        <a href="https://wheelsrpgs.itch.io/wheeldle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wheeldle</a>
                        <span> · </span>
                        <a href="https://devbanana.itch.io/infinidle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Infinidle</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-1.5 text-muted-foreground whitespace-nowrap align-top">Make bad guesses</td>
                      <td className="border border-border px-3 py-1.5">
                        <a href="https://lazyguyy.github.io/survivle/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Survivle</a>
                        <span> · </span>
                        <a href="https://dontwordle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Don't Wordle</a>
                        <span> · </span>
                        <a href="https://www.antiwordle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Antiwordle</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
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
              <span> · </span>
              <a href="https://play.woodle.today/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Woodle</a>
            </>
          )}
          {mode === "marbless" && (
            <a href="https://marbless.co/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Marbless</a>
          )}
          {mode === "dodeku" && (
            <a href="https://dodeku.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dodeku</a>
          )}
          {mode === "wordpeaks" && (
            <a href="https://vegeta897.github.io/word-peaks/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Peaks</a>
          )}
          {mode === "flippingletters" && (
            <a href="https://www.flippingletters.com/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flipping Letters</a>
          )}
          {mode === "worwordle" && (
            <a href="https://worwordle.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Worwordle</a>
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
            Enter your guesses and click each tile to cycle GREY (Absent) → YELLOW (Wrongly placed) → GREEN (correctly placed). Get all 5-letter words consistent with the feedback.
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
            Set up 2 to 4 columns of 5 letters each. Each move removes the bottom letter from any column. Find all orderings that spell valid 5-letter English words.
          </p>
        )}

        {mode === "dodeku" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Fill empty cells with the available tiles so that each given row and column sum matches. Use "X" for blocked cells, leave empties blank, or enter a fixed number.
          </p>
        )}
        {mode === "wordpeaks" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your guesses and click each tile to cycle GREEN SQUARE (correctly placed) → ORANGE TRIANGLE UP (the answer letter comes before this letter alphabetically) → LIGHT-BLUE TRIANGLE DOWN (the answer letter comes after this letter alphabetically). Get all 5-letter words consistent with the feedback.
          </p>
        )}
        {mode === "flippingletters" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter the 10 distinct letters in your bank. Click a letter to check whether it's flippable (b↔q, d↔p, n↔u, m↔w). Then enter Wordle-style guesses (grey → yellow → green) to filter the flippable 5-letter words.
          </p>
        )}
        {mode === "worwordle" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter Wordle-style 8-letter guesses (each = two 5-letter words "smushed" together, sharing 3 overlapping letters). Click each tile to cycle GREY → YELLOW → GREEN. Get all valid 8-letter Worwordle answers.
          </p>
        )}



        {mode === "worwordle" ? (
          <div className="space-y-4">
            {worGuesses.map((g, gi) => (
              <div key={gi} className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: 8 }).map((_, ti) => {
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
                        id={`wor-tile-${gi}-${ti}`}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        value={letter}
                        aria-label={`Guess ${gi + 1} tile ${ti + 1}: ${color}`}
                        onMouseDown={(e) => {
                          if (document.activeElement === e.currentTarget) {
                            e.preventDefault();
                            cycleWorTile(gi, ti);
                          }
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                          if (!v) { setWorLetter(gi, ti, ""); return; }
                          setWorLetter(gi, ti, v.slice(-1));
                          if (ti < 7) focusWorTile(gi, ti + 1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            if (!letter && ti > 0) { e.preventDefault(); focusWorTile(gi, ti - 1); }
                          } else if (e.key === "ArrowLeft") { e.preventDefault(); focusWorTile(gi, ti - 1); }
                          else if (e.key === "ArrowRight") { e.preventDefault(); focusWorTile(gi, ti + 1); }
                          else if (e.key === " " || e.key === "Enter") { e.preventDefault(); cycleWorTile(gi, ti); }
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded border-2 text-center font-mono text-xl font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${colorClass}`}
                      />
                    );
                  })}
                </div>
                {worGuesses.length > 1 && (
                  <Button onClick={() => removeWorRow(gi)} variant="outline" size="sm">Remove</Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addWorRow} variant="outline" size="lg">Add guess</Button>
              <Button
                onClick={() => {
                  setWorGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                  setWorResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button onClick={solveWorwordle} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "flippingletters" ? (
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm font-medium">Letter bank (10 distinct letters; click a tile to see if it flips)</div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const upper = (flLetters[i] || "").toUpperCase();
                  const flip = FL_FLIP_MAP[upper] || "";
                  const revealed = flRevealed[i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <input
                        type="text"
                        value={(flLetters[i] || "").toLowerCase()}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const c = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                          setFlLetters((prev) => { const n = [...prev]; n[i] = c; return n; });
                          setFlRevealed((prev) => { const n = [...prev]; n[i] = false; return n; });
                        }}
                        onClick={() => {
                          setFlRevealed((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
                        }}
                        className="h-12 w-12 rounded border-2 border-border bg-muted text-center font-mono text-xl font-bold lowercase outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        aria-label={`Letter ${i + 1}`}
                      />
                      <div className="h-5 text-xs font-mono text-muted-foreground">
                        {revealed && upper
                          ? (flip ? `↻ ${flip.toLowerCase()}` : "—")
                          : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {flGuesses.map((g, gi) => (
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
                        id={`fl-tile-${gi}-${ti}`}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        value={letter.toLowerCase()}
                        aria-label={`Guess ${gi + 1} tile ${ti + 1}: ${color}`}
                        onMouseDown={(e) => {
                          if (document.activeElement === e.currentTarget) {
                            e.preventDefault();
                            cycleFlTile(gi, ti);
                          }
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                          if (!v) { setFlLetter(gi, ti, ""); return; }
                          setFlLetter(gi, ti, v.slice(-1));
                          if (ti < 4) focusFlTile(gi, ti + 1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            if (!letter && ti > 0) { e.preventDefault(); focusFlTile(gi, ti - 1); }
                          } else if (e.key === "ArrowLeft") { e.preventDefault(); focusFlTile(gi, ti - 1); }
                          else if (e.key === "ArrowRight") { e.preventDefault(); focusFlTile(gi, ti + 1); }
                          else if (e.key === " " || e.key === "Enter") { e.preventDefault(); cycleFlTile(gi, ti); }
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded border-2 text-center font-mono text-xl font-bold lowercase outline-none transition focus:ring-2 focus:ring-ring ${colorClass}`}
                      />
                    );
                  })}
                </div>
                {flGuesses.length > 1 && (
                  <Button onClick={() => removeFlRow(gi)} variant="outline" size="sm">Remove</Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addFlRow} variant="outline" size="lg">Add guess</Button>
              <Button
                onClick={() => {
                  setFlGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                  setFlResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button onClick={solveFlippingLetters} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "wordpeaks" ? (
          <div className="space-y-4">
            {wordPeaksGuesses.map((g, gi) => (
              <div key={gi} className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, ti) => {
                    const letter = g.word[ti] && g.word[ti] !== " " ? g.word[ti] : "";
                    const dir = g.pattern[ti];
                    const bg =
                      dir === "CORRECT"
                        ? "#32CD32"
                        : dir === "BEFORE"
                          ? "#F4A460"
                          : dir === "AFTER"
                            ? "#4682B4"
                            : "transparent";
                    const clip =
                      dir === "BEFORE"
                        ? "polygon(50% 0%, 100% 100%, 0% 100%)"
                        : dir === "AFTER"
                          ? "polygon(0% 0%, 100% 0%, 50% 100%)"
                          : "none";
                    const isNone = dir === "NONE";
                    return (
                      <div
                        key={ti}
                        className="relative flex h-14 w-14 items-center justify-center"
                        style={{
                          backgroundColor: bg,
                          clipPath: clip === "none" ? undefined : clip,
                          borderRadius: clip === "none" ? "0.25rem" : 0,
                          border: isNone ? "2px solid #eab308" : undefined,
                        }}
                        onMouseDown={(e) => {
                          const tgt = e.target as HTMLElement;
                          if (tgt.tagName !== "INPUT") {
                            e.preventDefault();
                            cycleWPTile(gi, ti);
                          }
                        }}
                      >
                        <input
                          id={`wp-tile-${gi}-${ti}`}
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          value={letter}
                          aria-label={`Guess ${gi + 1} tile ${ti + 1}: ${dir}`}
                          onMouseDown={(e) => {
                            if (document.activeElement === e.currentTarget) {
                              e.preventDefault();
                              cycleWPTile(gi, ti);
                            }
                          }}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                            if (!v) {
                              setWPLetter(gi, ti, "");
                              return;
                            }
                            setWPLetter(gi, ti, v.slice(-1));
                            if (ti < 4) focusWPTile(gi, ti + 1);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              if (!letter && ti > 0) {
                                e.preventDefault();
                                focusWPTile(gi, ti - 1);
                              }
                            } else if (e.key === "ArrowLeft") {
                              e.preventDefault();
                              focusWPTile(gi, ti - 1);
                            } else if (e.key === "ArrowRight") {
                              e.preventDefault();
                              focusWPTile(gi, ti + 1);
                            } else if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              cycleWPTile(gi, ti);
                            }
                          }}
                          style={{
                            paddingTop: dir === "BEFORE" ? "16px" : dir === "AFTER" ? "0px" : "0px",
                          }}
                          className={`h-full w-full bg-transparent text-center font-mono text-xl font-bold uppercase outline-none ${isNone ? "text-foreground caret-current" : "text-white caret-white"}`}
                        />
                      </div>
                    );
                  })}
                </div>
                {wordPeaksGuesses.length > 1 && (
                  <Button onClick={() => removeWPRow(gi)} variant="outline" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addWPRow} variant="outline" size="lg">
                Add guess
              </Button>
              <Button
                onClick={() => {
                  setWordPeaksGuesses([{ word: "", pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] }]);
                  setWordPeaksResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  setWordPeaksGuesses((prev) => prev.map((g) => ({ ...g, pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] as WordPeaksDirection[] })));
                  setWordPeaksResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset shapes only
              </Button>
              <Button onClick={solveWordPeaks} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "wordle" ? (

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Optional: Input</span>
              <select
                className="rounded border border-border bg-background px-2 py-1"
                defaultValue="0"
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (n === 0) {
                    setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                    setWordleResults(null);
                    return;
                  }
                  const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                  if (!sheet || sheet.length === 0) return;
                  const row = sheet[Math.floor(Math.random() * sheet.length)];
                  setWordleGuesses(row.slice(0, n).map((w) => ({ word: w.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] })));
                  setWordleResults(null);
                }}
              >
                <option value="0">0</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <span>strategic starting words into the solver.</span>
            </div>
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
              <Button
                onClick={() => {
                  setWordleGuesses((prev) => prev.map((g) => ({ ...g, pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] })));
                  setWordleResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset colors only
              </Button>
              <Button onClick={solveWordle} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "spellingbee" ? (
          <div className="flex flex-col items-start gap-4">
            {(() => {
              const FLAT_HEX = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
              const renderTile = (i: number) => {
                const isMiddle = i === 3;
                const value = isMiddle
                  ? spellingBeeMiddle
                  : (spellingBeeOthers[i < 3 ? i : i - 1] || "");
                const onChange = (v: string) => {
                  const c = v.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                  if (isMiddle) {
                    setSpellingBeeMiddle(c);
                  } else {
                    const idx = i < 3 ? i : i - 1;
                    const padded = spellingBeeOthers.padEnd(6, " ").split("");
                    padded[idx] = c || " ";
                    setSpellingBeeOthers(padded.join("").replace(/ +$/, ""));
                  }
                  if (c && i < 6) {
                    const next = document.getElementById(`bee-tile-${i + 1}`) as HTMLInputElement | null;
                    next?.focus();
                    next?.select();
                  }
                };
                const TILE_W = 72;
                const TILE_H = 64;
                const R = 100;
                // i: 0=top (0°), 1=upper-right (60°), 2=lower-right (120°),
                // 3=middle, 4=bottom (180°), 5=lower-left (240°), 6=upper-left (300°)
                const bearingByIndex: Record<number, number | null> = {
                  0: 0, 1: 60, 2: 120, 3: null, 4: 180, 5: 240, 6: 300,
                };
                const bearing = bearingByIndex[i];
                let dx = 0, dy = 0;
                if (bearing !== null) {
                  const rad = (bearing * Math.PI) / 180;
                  dx = Math.sin(rad) * R;
                  dy = -Math.cos(rad) * R;
                }
                return (
                  <div
                    key={i}
                    className="absolute flex items-center justify-center"
                    style={{
                      width: `${TILE_W}px`,
                      height: `${TILE_H}px`,
                      left: `calc(50% + ${dx}px - ${TILE_W / 2}px)`,
                      top: `calc(50% + ${dy}px - ${TILE_H / 2}px)`,
                      clipPath: FLAT_HEX,
                      backgroundColor: isMiddle ? "#eab308" : "#d4d4d8",
                      zIndex: isMiddle ? 1 : 0,
                    }}
                  >
                    <input
                      id={`bee-tile-${i}`}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      maxLength={1}
                      className="h-full w-full bg-transparent text-center font-mono text-2xl font-bold uppercase text-black outline-none"
                      aria-label={isMiddle ? "Middle letter" : `Outer letter ${i < 3 ? i + 1 : i}`}
                    />
                  </div>
                );
              };
              return (
                <div className="relative" style={{ width: "260px", height: "280px" }}>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => renderTile(i))}
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setSpellingBeeMiddle("");
                  setSpellingBeeOthers("");
                  setSpellingBeeResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Clear all
              </Button>
              <Button onClick={solveSpellingBee} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>

        ) : mode === "mastermind" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Optional: Input</span>
              <select
                className="rounded border border-border bg-background px-2 py-1"
                defaultValue="0"
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (n === 0) {
                    setMastermindRows([{ word: "", greens: 0, yellows: 0 }]);
                    setMastermindResults(null);
                    return;
                  }
                  const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                  if (!sheet || sheet.length === 0) return;
                  const row = sheet[Math.floor(Math.random() * sheet.length)];
                  setMastermindRows(row.slice(0, n).map((w) => ({ word: w.toUpperCase(), greens: 0, yellows: 0 })));
                  setMastermindResults(null);
                }}
              >
                <option value="0">0</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <span>strategic starting words into the solver.</span>
            </div>
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
              <Button
                onClick={() => {
                  setMastermindRows((prev) => prev.map((r) => ({ ...r, greens: 0, yellows: 0 })));
                  setMastermindResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset colors only
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
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-center font-mono text-xl font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${ri === 0 ? "bg-yellow-500 text-white border-yellow-500 caret-white" : "border-border bg-muted text-foreground"}`}
                    />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setMarblessColumns((prev) => prev.map(() => ["", "", "", "", ""]));
                  setMarblessResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Clear all
              </Button>
              <Button onClick={solveMarbless} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>

          </div>

        ) : mode === "dodeku" ? (
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium">Grid (use "X" for blocked, blank for empty, or a fixed number)</div>
              <div className="inline-block">
                {[0, 1, 2, 3].map((r) => (
                  <div key={r} className="mt-1.5 flex gap-1.5 first:mt-0">
                    {[0, 1, 2, 3].map((c) => {
                      const v = dodekuGrid[r][c];
                      const isBlocked = v === "X" || v === "x";
                      return (
                        <input
                          key={c}
                          value={v}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const cleaned = /^[xX]$/.test(raw) ? "X" : raw.replace(/[^0-9]/g, "");
                            setDodekuGrid((prev) =>
                              prev.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? cleaned : x)) : row)),
                            );
                          }}
                          className={`flex h-12 w-12 items-center justify-center rounded border-2 border-border text-center font-mono text-lg font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${isBlocked ? "bg-foreground text-background" : "bg-muted text-foreground"}`}
                          aria-label={`Cell row ${r + 1} col ${c + 1}`}
                        />
                      );
                    })}
                    <input
                      value={dodekuRowSums[r]}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setDodekuRowSums((prev) => prev.map((x, i) => (i === r ? v : x)));
                      }}
                      placeholder="—"
                      className="ml-1.5 h-12 w-12 rounded border border-input bg-background text-center font-mono text-sm"
                      aria-label={`Row ${r + 1} sum`}
                    />
                  </div>
                ))}
                <div className="mt-1.5 flex gap-1.5">
                  {[0, 1, 2, 3].map((c) => (
                    <input
                      key={c}
                      value={dodekuColSums[c]}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setDodekuColSums((prev) => prev.map((x, i) => (i === c ? v : x)));
                      }}
                      placeholder="—"
                      className="h-9 w-12 rounded border border-input bg-background text-center font-mono text-sm"
                      aria-label={`Column ${c + 1} sum`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Available tiles (comma-separated)</label>
              <Input
                value={dodekuTiles}
                onChange={(e) => setDodekuTiles(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setDodekuGrid([["","","",""],["","","",""],["","","",""],["","","",""]]);
                  setDodekuRowSums(["","","",""]);
                  setDodekuColSums(["","","",""]);
                  setDodekuTiles("");
                  setDodekuResult(null);
                }}
                variant="outline"
                size="lg"
              >
                Clear all
              </Button>
              <Button onClick={solveDodeku} disabled={solving} size="lg">
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
              {paths.slice(pagePaths * 50, pagePaths * 50 + 50).map((path, idx) => {
                const i = pagePaths * 50 + idx;
                return (
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
                );
              })}
            </ol>
            <Paginator page={pagePaths} setPage={setPagePaths} total={paths.length} />
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
              {sliceGroups(reversed, pageWordiply).map(([extra, words]) => (
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
            <Paginator page={pageWordiply} setPage={setPageWordiply} total={wordiplyResults.reduce((n, [, ws]) => n + ws.length, 0)} />
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
                {wordleResults.slice(pageWordle * 50, pageWordle * 50 + 50).map((w) => (
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
            <Paginator page={pageWordle} setPage={setPageWordle} total={wordleResults.length} />
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
                {sliceGroups(spellingBeeResults, pageBee).map(([score, words]) => (
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
              <Paginator page={pageBee} setPage={setPageBee} total={spellingBeeResults.reduce((n, [, ws]) => n + ws.length, 0)} />
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
                {mastermindResults.slice(pageMM * 50, pageMM * 50 + 50).map((w) => (
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
            <Paginator page={pageMM} setPage={setPageMM} total={mastermindResults.length} />
          </section>
        )}

        {wordPeaksResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {wordPeaksResults.length} possible {wordPeaksResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${wordPeaksResults.length} possible ${wordPeaksResults.length === 1 ? "answer" : "answers"}:\n${wordPeaksResults.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {wordPeaksResults.slice(pageWP * 50, pageWP * 50 + 50).map((w) => (
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
            <Paginator page={pageWP} setPage={setPageWP} total={wordPeaksResults.length} />
          </section>
        )}

        {flResults && (
          <section className="mt-10">
            <div className="mb-2 text-sm text-muted-foreground">
              {flResults.flippable.length} flippable 5-letter {flResults.flippable.length === 1 ? "word" : "words"} from your letter bank.
            </div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {flResults.answers.length} possible {flResults.answers.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${flResults.answers.length} possible ${flResults.answers.length === 1 ? "answer" : "answers"}:\n${flResults.answers.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {flResults.answers.slice(pageFl * 50, pageFl * 50 + 50).map((w) => (
                  <a
                    key={w}
                    href={`https://www.dictionary.com/browse/${w.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w.toLowerCase()}
                  </a>
                ))}
              </div>
            </div>
            <Paginator page={pageFl} setPage={setPageFl} total={flResults.answers.length} />
          </section>
        )}

        {worResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {worResults.length} possible {worResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  const items = worResults.map((w) => {
                    const [a, b] = worwordleSplit(w);
                    return `${w} (${a} + ${b})`;
                  }).join(", ");
                  copyText(`${worResults.length} possible ${worResults.length === 1 ? "answer" : "answers"}:\n${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-2 font-mono text-sm">
                {worResults.slice(pageWor * 50, pageWor * 50 + 50).map((w) => {
                  const [a, b] = worwordleSplit(w);
                  return (
                    <div key={w} className="flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-1 font-semibold tracking-widest">{w}</span>
                      <span className="text-muted-foreground">=</span>
                      <a href={`https://www.dictionary.com/browse/${a.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground">{a}</a>
                      <span className="text-muted-foreground">+</span>
                      <a href={`https://www.dictionary.com/browse/${b.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground">{b}</a>
                    </div>
                  );
                })}
              </div>
            </div>
            <Paginator page={pageWor} setPage={setPageWor} total={worResults.length} />
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
              {marblessResults.slice(pageMarbless * 50, pageMarbless * 50 + 50).map((sol, idx) => {
                const i = pageMarbless * 50 + idx;
                return (
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
                );
              })}
            </ol>
            <Paginator page={pageMarbless} setPage={setPageMarbless} total={marblessResults.length} />

          </section>
        )}

        {dodekuResult && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">Solution</h2>
            <div className="inline-block rounded-lg border bg-card p-4">
              <table className="border-collapse font-mono">
                <tbody>
                  {dodekuResult.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => {
                        const isBlocked = cell === "X";
                        return (
                          <td
                            key={c}
                            className={`h-12 w-12 border border-border text-center text-lg font-bold ${isBlocked ? "bg-foreground text-background" : "bg-muted text-foreground"}`}
                          >
                            {isBlocked ? "X" : String(cell)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}



      </div>

    </div>
  );
}
