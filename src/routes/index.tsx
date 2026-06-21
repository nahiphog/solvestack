import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useState } from "react";
import { dodekuSolve, fibbleSolve, findAllShortestPaths, flippingLettersSolve, formatPivotsWord, getRandomWords, isValid5LetterWord, isValidJeffGoldblumWord, isValidNLetterWord, isValidWord, jeffGoldblumLeSolve, marblessSolve, mastermindSolve, MODE_WORD_LENGTH, pivotsBracketRange, sheetdokuSolve, spellingBeeSolve, wordiplySearch, wordleSolve, wordPeaksSolve, worwordleSolve, worwordleSplit, type DodekuCell, type MarblessSolution, type Mode, type SheetdokuFunc, type SheetdokuRegionDef, type WordleColor, type WordPeaksDirection } from "@/lib/wordLadder";
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
  fibble: { start: "", goal: "" },
  spellingbee: { start: "T", goal: "OWERAB" },
  craftwords: { start: "BREAK", goal: "EVEN" },
  mastermind: { start: "WATER", goal: "" },
  marbless: { start: "", goal: "" },
  dodeku: { start: "", goal: "" },
  wordpeaks: { start: "PEDAL", goal: "" },
  flippingletters: { start: "", goal: "" },
  worwordle: { start: "", goal: "" },
  sheetdoku: { start: "", goal: "" },
  jeffgoldblum: { start: "", goal: "" },

};

const FL_FLIP_MAP: Record<string, string> = {
  A: "E", E: "A", B: "Q", Q: "B", D: "P", P: "D", N: "U", U: "N", M: "W", W: "M",
};

const WOR_STARTING_PAIRS: [string, string][] = [
  ["ABIDECKS", "FORTHUMP"],
  ["ALIGNOME", "BURPSYCH"],
  ["PRUDECAY", "FILTHONG"],
  ["KNIFECAL", "GHOSTUDY"],
  ["FLAMEDIC", "GHOSTUNK"],
  ["GUESTACK", "HYDROBIN"],
];

const FL_POTENTIAL_WORDS: string[] = [
  "TABLE","CHAIR","PHONE","BREAD","LIGHT","PLATE","KNIFE","CLOUD","STONE","PLANT",
  "EARTH","OCEAN","BEACH","FIELD","WRITE","DANCE","SPEAK","LAUGH","DRINK","DRIVE",
  "BUILD","TEACH","LEARN","WATCH","ANGRY","QUIET","TIRED","PROUD","BRAVE","NURSE",
  "PILOT","JUDGE","CHILD","ADULT","GUEST","BLACK","WHITE","BROWN","IVORY","PEACH",
  "MANGO","LEMON","SUGAR","HONEY","MONEY","HOUSE","WATER","MUSIC","DREAM","STORY",
  "MOVIE","NOTES","TRAIN","PLANE","HOTEL","TOWER","ROADS","WORLD","HEART","BRAIN",
  "POWER","SOUND","VOICE","SMILE","FAITH",
];


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
  const [mastermindLen, setMastermindLen] = useState<4 | 5>(5);
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
  const [flStartingWords, setFlStartingWords] = useState<0 | 1 | 2>(0);
  const [flLocked, setFlLocked] = useState<boolean>(false);

  const flExpandedSet = (): Set<string> => {
    const set = new Set<string>();
    flLetters.forEach((l, i) => {
      const u = (l || "").toUpperCase();
      if (!u) return;
      set.add(u);
      if (flRevealed[i]) {
        const f = FL_FLIP_MAP[u];
        if (f) set.add(f);
      }
    });
    return set;
  };

  const applyFlStartingWords = (count: 0 | 1 | 2) => {
    setFlStartingWords(count);
    if (count === 0) {
      setFlGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    } else {
      const allowed = flExpandedSet();
      const eligible = FL_POTENTIAL_WORDS.filter((w) => {
        const upper = w.toUpperCase();
        for (const ch of upper) if (!allowed.has(ch)) return false;
        return true;
      });
      const pool = [...eligible];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const picks: string[] = [];
      const seen = new Set<string>();
      for (const w of pool) {
        if (!seen.has(w)) { seen.add(w); picks.push(w); }
        if (picks.length >= count) break;
      }
      while (picks.length < count) picks.push("");
      setFlGuesses(picks.map((w) => ({ word: w, pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] })));
    }
    setFlResults(null);
  };

  const toggleFlLock = () => {
    if (flLocked) {
      // Unlocking: clear lower section state
      setFlLocked(false);
      setFlGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
      setFlStartingWords(0);
      setFlResults(null);
      setError(null);
    } else {
      // Validate before locking
      const letters = flLetters.map((l) => (l || "").trim().toUpperCase()).filter(Boolean);
      if (letters.length !== 10) {
        setError("Please enter all 10 letters before locking.");
        return;
      }
      if (new Set(letters).size !== 10) {
        setError("The 10 letters must be distinct.");
        return;
      }
      setError(null);
      setFlLocked(true);
    }
  };


  const [worGuesses, setWorGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [worResults, setWorResults] = useState<string[] | null>(null);
  const [pageWor, setPageWor] = useState(0);
  const [worStartingWords, setWorStartingWords] = useState<0 | 2>(0);

  const applyWorStartingWords = (count: 0 | 2) => {
    setWorStartingWords(count);
    if (count === 2) {
      const pair = WOR_STARTING_PAIRS[Math.floor(Math.random() * WOR_STARTING_PAIRS.length)];
      setWorGuesses([
        { word: pair[0], pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
        { word: pair[1], pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
      ]);
    } else {
      setWorGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    }
    setWorResults(null);
  };

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
  const [dodekuResult, setDodekuResult] = useState<DodekuCell[][][] | null>(null);
  const [pageDodeku, setPageDodeku] = useState(0);
  const [sdRegions, setSdRegions] = useState<number[][]>([
    [1,1,2,2,3],
    [1,1,2,2,3],
    [1,1,2,4,4],
    [1,5,5,4,4],
    [5,5,5,6,6],
  ]);
  const [sdInitial, setSdInitial] = useState<string[][]>([
    ["","","","1",""],
    ["","","","",""],
    ["","","","","2"],
    ["","3","","",""],
    ["","","","",""],
  ]);
  const [sdRegionDefs, setSdRegionDefs] = useState<Record<number, { func: SheetdokuFunc; target: string }>>({
    1: { func: "MAX", target: "5" },
    2: { func: "SUM", target: "10" },
    3: { func: "MIN", target: "4" },
    4: { func: "MIN", target: "1" },
    5: { func: "RANGE", target: "4" },
    6: { func: "SUM", target: "5" },
  });
  const [sdPaintRegion, setSdPaintRegion] = useState<number>(0);
  const [sdResults, setSdResults] = useState<number[][][] | null>(null);
  const [pageSd, setPageSd] = useState(0);
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
  const [selectedPaths, setSelectedPaths] = useState<Set<number>>(new Set());
  useEffect(() => { setPagePaths(0); setSelectedPaths(new Set()); }, [paths]);
  useEffect(() => { setPageWordle(0); }, [wordleResults]);
  useEffect(() => { setPageMM(0); }, [mastermindResults]);
  useEffect(() => { setPageWP(0); }, [wordPeaksResults]);

  useEffect(() => { setPageMarbless(0); }, [marblessResults]);
  useEffect(() => { setPageWordiply(0); }, [wordiplyResults]);
  useEffect(() => { setPageBee(0); }, [spellingBeeResults]);
  useEffect(() => { setPageFl(0); }, [flResults]);
  useEffect(() => { setPageWor(0); }, [worResults]);
  useEffect(() => { setPageSd(0); }, [sdResults]);

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
    setSdResults(null);
    setError(null);
    if (m === "fibble") {
      setWordleGuesses([{ word: "CRANE", pattern: ["GREEN", "GREY", "YELLOW", "GREY", "GREY"] }]);
    } else if (m === "wordle") {
      setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    } else if (m === "jeffgoldblum") {
      setWordleGuesses([{ word: "JEFFGOLDBLUM", pattern: Array(12).fill("GREY") as WordleColor[] }]);
    }
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
    if (rs.every((v) => v === null) && cs.every((v) => v === null)) {
      setError("The row sums and column sums cannot be all empty");
      return;
    }
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
    setPageDodeku(0);
    setTimeout(() => {
      const res = dodekuSolve(initial, rs, cs, tiles);
      if (res.length === 0) setError("No solution found.");
      else setDodekuResult(res);
      setSolving(false);
    }, 0);
  };

  const solveSheetdoku = () => {
    setError(null);
    setSdResults(null);
    const N = 5;
    const initial: number[][] = sdInitial.map((row) =>
      row.map((v) => {
        const s = v.trim();
        if (!s) return 0;
        const n = parseInt(s, 10);
        return Number.isFinite(n) && n >= 1 && n <= N ? n : 0;
      }),
    );
    const usedRegions = new Set<number>();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) usedRegions.add(sdRegions[r][c]);
    const defs: Record<number, SheetdokuRegionDef> = {};
    for (const reg of usedRegions) {
      if (reg === 0) continue; // regionless has no constraint
      const d = sdRegionDefs[reg];
      if (!d) { setError(`Region ${reg}: no function defined.`); return; }
      const t = parseInt(d.target, 10);
      if (!Number.isFinite(t)) { setError(`Region ${reg}: invalid target value.`); return; }
      defs[reg] = { func: d.func, target: t };
    }
    // Validate fixed values vs row/col uniqueness
    for (let r = 0; r < N; r++) {
      const seen = new Set<number>();
      for (let c = 0; c < N; c++) {
        const v = initial[r][c];
        if (v === 0) continue;
        if (seen.has(v)) { setError(`Row ${r + 1}: duplicate fixed value ${v}.`); return; }
        seen.add(v);
      }
    }
    for (let c = 0; c < N; c++) {
      const seen = new Set<number>();
      for (let r = 0; r < N; r++) {
        const v = initial[r][c];
        if (v === 0) continue;
        if (seen.has(v)) { setError(`Column ${c + 1}: duplicate fixed value ${v}.`); return; }
        seen.add(v);
      }
    }
    setSolving(true);
    setTimeout(() => {
      const res = sheetdokuSolve(N, sdRegions, initial, defs);
      if (res.length === 0) setError("No solutions found.");
      else setSdResults(res);
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
      if (w.length !== mastermindLen) {
        setError(`Row ${i + 1}: guess must be exactly ${mastermindLen} letters.`);
        return;
      }
      if (!(await isValidNLetterWord(w, mastermindLen))) {
        setError(`Row ${i + 1}: "${w}" is not a valid ${mastermindLen}-letter English word.`);
        return;
      }
      if (row.greens + row.yellows > mastermindLen) {
        setError(`Row ${i + 1}: correct + wrong cannot exceed ${mastermindLen}.`);
        return;
      }
    }
    setSolving(true);
    const perRow = await Promise.all(
      mastermindRows.map((r) => mastermindSolve(r.word.toUpperCase(), r.greens, r.yellows, mastermindLen)),
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
        const padded = r.word.padEnd(mastermindLen, " ").slice(0, mastermindLen).split("");
        padded[ti] = c || " ";
        return { ...r, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };

  const focusMastermindTile = (ri: number, ti: number) => {
    if (ti < 0 || ti >= mastermindLen) return;
    const el = document.getElementById(`mastermind-tile-${ri}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const addMastermindRow = () => {
    setMastermindRows((prev) => [...prev, { word: "", greens: 0, yellows: 0 }]);
  };

  const addMastermindGuessFromAnswer = (word: string) => {
    setMastermindRows((prev) => [...prev, { word: word.toUpperCase(), greens: 0, yellows: 0 }]);
    setMastermindResults(null);
  };

  const addWordleGuessFromAnswer = (word: string) => {
    setWordleGuesses((prev) => [...prev, { word: word.toUpperCase(), pattern: Array(wordleTileLen).fill("GREY") as WordleColor[] }]);
    setWordleResults(null);
  };

  const addWordPeaksGuessFromAnswer = (word: string) => {
    setWordPeaksGuesses((prev) => [...prev, { word: word.toUpperCase(), pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] }]);
    setWordPeaksResults(null);
  };

  const addWorGuessFromAnswer = (word: string) => {
    setWorGuesses((prev) => [...prev, { word: word.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    setWorResults(null);
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




  const wordleTileLen = mode === "jeffgoldblum" ? 12 : 5;

  const solveWordle = async () => {
    setError(null);
    setWordleResults(null);
    for (const g of wordleGuesses) {
      const w = g.word.trim().toUpperCase();
      if (w.length !== wordleTileLen) {
        setError(`Each guess must be exactly ${wordleTileLen} letters.`);
        return;
      }
      if (mode === "jeffgoldblum") {
        if (!(await isValidJeffGoldblumWord(w))) {
          setError(`"${w}" is not a valid 12-letter English word.`);
          return;
        }
      } else if (!(await isValid5LetterWord(w))) {
        setError(`"${w}" is not a valid 5-letter English word.`);
        return;
      }
    }
    setSolving(true);
    const normalized = wordleGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    const result =
      mode === "fibble" ? await fibbleSolve(normalized)
      : mode === "jeffgoldblum" ? await jeffGoldblumLeSolve(normalized)
      : await wordleSolve(normalized);
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
        const padded = g.word.padEnd(wordleTileLen, " ").slice(0, wordleTileLen).split("");
        padded[ti] = c || " ";
        return { ...g, word: padded.join("").replace(/ +$/, "") };
      }),
    );
  };

  const focusTile = (gi: number, ti: number) => {
    if (ti < 0 || ti >= wordleTileLen) return;
    const el = document.getElementById(`wordle-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  const addGuessRow = () => {
    setWordleGuesses((prev) => [...prev, { word: "", pattern: Array(wordleTileLen).fill("GREY") as WordleColor[] }]);
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
    void flips;
    const allowed = [...letters];
    const bankSet = new Set(letters);
    for (const g of flGuesses) {
      const w = g.word.trim().toUpperCase();
      if (w.length !== 5) {
        setError("Each guess must be exactly 5 letters.");
        return;
      }
      for (const ch of w) {
        if (!bankSet.has(ch)) {
          setError(`"${w}" uses "${ch.toLowerCase()}" which is not in the letter bank.`);
          return;
        }
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
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/about"
              className="rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              About
            </Link>
            <Link
              to="/faq"
              className="rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              FAQ
            </Link>
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-md border bg-muted p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="mb-3 flex w-fit rounded-md border bg-muted p-1">
          {SECTIONS.map((s) => {
            const isMath = mode === "dodeku" || mode === "sheetdoku";
            const inSearch = mode === "wordle" || mode === "fibble" || mode === "spellingbee" || mode === "mastermind" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum";
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
                  ? mode === 4 || mode === 5 || mode === 6 || mode === "weaverx" || mode === "craftwords"
                  : mode === "splice" || mode === "pivots";
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

        {(mode === "wordle" || mode === "fibble" || mode === "mastermind" || mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum") && (
          <div className="mb-6 flex w-fit rounded-md border bg-muted p-1">
            {SEARCH_MODES.map((m) => {
              const isActive =
                m.id === "wordle"
                  ? mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum"
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

        {(mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum") && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("wordle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wordle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              (Original)
            </button>
            <button
              onClick={() => switchMode("fibble")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "fibble"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fibble
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
              onClick={() => switchMode("jeffgoldblum")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "jeffgoldblum"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JeffGoldblumLe
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
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
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

        {(mode === "dodeku" || mode === "sheetdoku") && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("dodeku")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "dodeku"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dodeku
            </button>
            <button
              onClick={() => switchMode("sheetdoku")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "sheetdoku"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sheetdoku
            </button>
          </div>
        )}







        {(mode === 4 || mode === 5 || mode === 6 || mode === "weaverx" || mode === "craftwords") && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode(5)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === 4 || mode === 5 || mode === 6
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              (X letters)
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
              onClick={() => switchMode("weaverx")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "weaverx"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weaver X
            </button>
          </div>
        )}

        {(mode === 4 || mode === 5 || mode === 6) && (
          <>
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver</a>
              <span>·</span>
              <a href="https://flipple.clevergoat.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flipple</a>
              <span>·</span>
              <a href="https://poople.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Poople</a>
              <span>·</span>
              <a href="https://wordchains.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Chains</a>
            </div>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <label htmlFor="word-length-select" className="text-muted-foreground">Word length:</label>
              <select
                id="word-length-select"
                value={mode}
                onChange={(e) => switchMode(Number(e.target.value) as Mode)}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
              <span className="text-muted-foreground">letters.</span>
            </div>
          </>
        )}

        {(mode === "splice" || mode === "pivots") && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("pivots")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "pivots"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Play Pivots
            </button>
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
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {mode === "splice" && (
            <a href="https://wordsplice.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Word Splice</a>
          )}
          

          
          {mode === "weaverx" && (
            <a href="https://wordwormdormdork.com/weaver-x/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver X</a>
          )}
          {mode === "pivots" && (
            <a href="https://playpivots.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Play Pivots</a>
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
                className="w-48 justify-between gap-1"
              >
                {showWordleVariations ? (
                  <><span>Hide table</span> <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <><span>See more variations</span> <ChevronDown className="h-4 w-4" /></>
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
              <span> · </span>
              <a href="https://blindle.kahveciderin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Blindle</a>
              <span> · </span>
              <a href="https://play-cows-and-bulls.web.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cows and Bulls</a>
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
          {mode === "fibble" && (
            <a href="https://fibble.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Fibble</a>
          )}
          {mode === "jeffgoldblum" && (
            <a href="https://jeffgoldblumle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JeffGoldblumLe</a>
          )}
        </div>



        {(mode === 4 || mode === 5 || mode === 6) && (
          <div className="mb-4 text-sm text-muted-foreground">
            <p>Permissible move:</p>
            <ul className="list-disc pl-5">
              <li>Single letter substitution</li>
            </ul>
          </div>
        )}

        {mode === "craftwords" && (
          <div className="mb-4 text-sm text-muted-foreground">
            <p>Permissible move:</p>
            <ul className="list-disc pl-5">
              <li>Single letter substitution</li>
              <li>Add a letter</li>
              <li>Remove a letter</li>
              <li>Rearrange the letters</li>
            </ul>
          </div>
        )}

        {mode === "splice" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Chain 5-letter words where each next word begins with the last 2 or 3 letters of the previous word.
          </p>
        )}

        {mode === "weaverx" && (
          <div className="mb-4 text-sm text-muted-foreground">
            <p>Permissible move:</p>
            <ul className="list-disc pl-5">
              <li>Single letter substitution</li>
              <li>Add a letter</li>
              <li>Remove a letter</li>
            </ul>
          </div>
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
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter your guesses.</p>
            <p>Click tiles to toggle between different colors:</p>
            <ul className="list-disc pl-5">
              <li>Green tile: It is correct.</li>
              <li>Yellow tile: Correct letter but in the wrong place.</li>
              <li>Grey tile: Absent letter.</li>
            </ul>
            <p>Get all 5-letter words consistent with the feedback.</p>
          </div>
        )}

        {mode === "fibble" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Just like Wordle, but it lies to you once every row.
          </p>
        )}

        {mode === "jeffgoldblum" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter Wordle-style 12-letter guesses, but you only have 3 tries, and it also accepts "JEFFGOLDBLUM".
          </p>
        )}


        {mode === "spellingbee" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter the middle letter and the 6 outer letters. Find all valid 4+ letter words using only these 7 letters that include the middle letter, grouped by score.
          </p>
        )}

        {mode === "mastermind" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter your guesses. And input the number of correct and wrong placements.</p>
            <p>Get all words consistent with the feedback.</p>
          </div>
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
        {mode === "sheetdoku" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p><a href="https://www.sheetdoku.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sheetdoku</a></p>
            <p>Fill a 5×5 Latin square (each row and column contains 1–5 exactly once) partitioned into regions.</p>
            <p>For each region, set its function and target value.</p>
            <p>Pick a region color, then click cells to assign them. Enter any pre-filled cell values inside the grid.</p>
          </div>
        )}
        {mode === "wordpeaks" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter your guesses.</p>
            <ul className="list-disc pl-5">
              <li>Orange tile: it comes after the letter alphabetically.</li>
              <li>Blue tile: it comes below the letter alphabetically.</li>
              <li>Green tile: It is correct.</li>
            </ul>
            <p>Get all 5-letter words consistent with the feedback.</p>
          </div>
        )}
        {mode === "flippingletters" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter the 10 distinct letters into your bank.</p>
            <p>Some letters are flippable:</p>
            <ul className="list-disc pl-5">
              <li>a ↔ e</li>
              <li>b ↔ q</li>
              <li>d ↔ p</li>
              <li>n ↔ u</li>
              <li>m ↔ w</li>
            </ul>
            <p>Then enter Wordle-style guesses (grey → yellow → green) to filter the flippable 5-letter words.</p>
          </div>
        )}
        {mode === "worwordle" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter Wordle-style 8-letter guesses.</p>
            <p>Each guess consists of two 5-letter words "smushed" together, sharing two overlapping letters. For example:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>MIC<span className="text-green-600">RO</span>UND = MIC<span className="text-green-600">RO</span> + <span className="text-green-600">RO</span>UND</li>
              <li>YOU<span className="text-green-600">TH</span>INK = YOU<span className="text-green-600">TH</span> + <span className="text-green-600">TH</span>INK</li>
            </ul>
          </div>
        )}
        {mode === "worwordle" && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Optional input: Place</span>
            <select
              value={worStartingWords}
              onChange={(e) => applyWorStartingWords(Number(e.target.value) as 0 | 2)}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              <option value={0}>0</option>
              <option value={2}>2</option>
            </select>
            <span className="text-muted-foreground">strategic starting words.</span>
          </div>
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
                  <Button onClick={() => removeWorRow(gi)} variant="outline" size="sm">×</Button>
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
              <Button
                onClick={() => {
                  setWorGuesses((prev) => prev.map((g) => ({ ...g, pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] })));
                  setWorResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset colors only
              </Button>
              <Button onClick={solveWorwordle} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : mode === "flippingletters" ? (
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm font-medium">Letter bank (10 distinct letters; click a tile if it is flippable)</div>
              <div className="grid grid-cols-5 gap-2 w-fit">
                {Array.from({ length: 10 }).map((_, i) => {
                  const upper = (flLetters[i] || "").toUpperCase();
                  const flip = FL_FLIP_MAP[upper] || "";
                  const revealed = flRevealed[i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <input
                        id={`fl-bank-${i}`}
                        type="text"
                        value={(flLetters[i] || "").toLowerCase()}
                        disabled={flLocked}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => {
                          if (flLocked) return;
                          const c = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                          setFlLetters((prev) => { const n = [...prev]; n[i] = c; return n; });
                          setFlRevealed((prev) => { const n = [...prev]; n[i] = false; return n; });
                          if (c && i < 9) {
                            const next = document.getElementById(`fl-bank-${i + 1}`) as HTMLInputElement | null;
                            next?.focus();
                          }
                        }}
                        onClick={() => {
                          if (flLocked) return;
                          setFlRevealed((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
                        }}
                        className={`h-12 w-12 rounded border-2 border-yellow-500 bg-muted text-center font-mono text-xl font-bold lowercase outline-none focus:ring-2 focus:ring-ring ${flLocked ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
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

            <div>
              <Button onClick={toggleFlLock} variant={flLocked ? "outline" : "default"} size="lg">
                {flLocked ? "Unlock these letters" : "Lock these letters"}
              </Button>
            </div>

            {flLocked && (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>Optional input: Place</span>
                  <select
                    className="rounded border border-border bg-background px-2 py-1"
                    value={flStartingWords}
                    onChange={(e) => applyFlStartingWords(parseInt(e.target.value, 10) as 0 | 1 | 2)}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  <span>flippable word(s) into the input.</span>
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
                              const bankSet = new Set(flLetters.map((l) => (l || "").toUpperCase()).filter(Boolean));
                              const ch = v.slice(-1);
                              if (!bankSet.has(ch)) return;
                              setFlLetter(gi, ti, ch);
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
                      <Button onClick={() => removeFlRow(gi)} variant="outline" size="sm">×</Button>
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
              </>
            )}
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
                          ? "#4682B4"
                          : dir === "AFTER"
                            ? "#F4A460"
                            : "transparent";
                    const clip =
                      dir === "BEFORE"
                        ? "polygon(0% 0%, 100% 0%, 50% 100%)"
                        : dir === "AFTER"
                          ? "polygon(50% 0%, 100% 100%, 0% 100%)"
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
                          border: isNone ? "2px solid #fde047" : undefined,
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
                            paddingTop: dir === "AFTER" ? "16px" : "0px",
                          }}
                          className={`h-full w-full bg-transparent text-center font-mono text-xl font-bold uppercase outline-none ${isNone ? "text-foreground caret-current" : "text-white caret-white"}`}
                        />
                      </div>
                    );
                  })}
                </div>
                {wordPeaksGuesses.length > 1 && (
                  <Button onClick={() => removeWPRow(gi)} variant="outline" size="sm">×</Button>
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
        ) : (mode === "wordle" || mode === "fibble" || mode === "jeffgoldblum") ? (

          <div className="space-y-4">
            {mode !== "jeffgoldblum" && (
              <div className="flex items-center gap-2 text-sm">
                <span>Optional input: {mode === "fibble" ? "Add" : "Place"}</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue="0"
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (n === 0) {
                      if (mode === "fibble") return;
                      setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                      setWordleResults(null);
                      return;
                    }
                    const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                    if (!sheet || sheet.length === 0) return;
                    const row = sheet[Math.floor(Math.random() * sheet.length)];
                    const newGuesses = row.slice(0, n).map((w) => ({ word: w.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] }));
                    if (mode === "fibble") {
                      setWordleGuesses((prev) => [...prev, ...newGuesses]);
                    } else {
                      setWordleGuesses(newGuesses);
                    }
                    setWordleResults(null);
                  }}
                >
                  <option value="0">0</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <span>strategic starting words.</span>
              </div>
            )}
            {wordleGuesses.map((g, gi) => (
              <div key={gi} className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: wordleTileLen }).map((_, ti) => {
                    const letter = g.word[ti] && g.word[ti] !== " " ? g.word[ti] : "";
                    const color = g.pattern[ti];
                    const colorClass =
                      color === "GREEN"
                        ? "bg-green-600 text-white border-green-600 caret-white"
                        : color === "YELLOW"
                          ? "bg-yellow-500 text-white border-yellow-500 caret-white"
                          : "bg-muted text-foreground border-border caret-foreground";
                    const tileSize = mode === "jeffgoldblum" ? "h-9 w-9 text-base" : "h-12 w-12 text-xl";
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
                          if (ti < wordleTileLen - 1) focusTile(gi, ti + 1);
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
                        className={`flex items-center justify-center rounded border-2 text-center font-mono font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${tileSize} ${colorClass}`}
                      />
                    );
                  })}
                </div>
                {wordleGuesses.length > 1 && (
                  <Button onClick={() => removeGuessRow(gi)} variant="outline" size="sm">×</Button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button onClick={addGuessRow} variant="outline" size="lg">
                Add guess
              </Button>
              <Button
                onClick={() => {
                  if (mode === "jeffgoldblum") {
                    setWordleGuesses([{ word: "JEFFGOLDBLUM", pattern: Array(12).fill("GREY") as WordleColor[] }]);
                  } else {
                    setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                  }
                  setWordleResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  setWordleGuesses((prev) => prev.map((g) => ({ ...g, pattern: Array(wordleTileLen).fill("GREY") as WordleColor[] })));
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
                Reset
              </Button>
              <Button
                onClick={() => {
                  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                  for (let i = alphabet.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
                  }
                  const seven = alphabet.slice(0, 7);
                  setSpellingBeeMiddle(seven[0]);
                  setSpellingBeeOthers(seven.slice(1).join(""));
                  setSpellingBeeResults(null);
                }}
                variant="outline"
                size="lg"
              >
                Randomize
              </Button>
              <Button onClick={solveSpellingBee} disabled={solving} size="lg">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>


        ) : mode === "mastermind" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Word length:</span>
              <select
                value={mastermindLen}
                onChange={(e) => {
                  const n = Number(e.target.value) as 4 | 5;
                  setMastermindLen(n);
                  setMastermindRows([{ word: "", greens: 0, yellows: 0 }]);
                  setMastermindResults(null);
                }}
                className="rounded border border-border bg-background px-2 py-1"
              >
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              <span>letters.</span>
            </div>
            {mastermindLen === 5 && (
              <div className="flex items-center gap-2 text-sm">
                <span>Optional input: Place</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue=""
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                    if (!sheet || sheet.length === 0) return;
                    const row = sheet[Math.floor(Math.random() * sheet.length)];
                    setMastermindRows(row.slice(0, n).map((w) => ({ word: w.toUpperCase(), greens: 0, yellows: 0 })));
                    setMastermindResults(null);
                  }}
                >
                  <option value="" disabled>—</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <span>strategic starting words into the solver.</span>
              </div>
            )}
            {mastermindLen === 4 && (
              <div className="flex items-center gap-2 text-sm">
                <span>Optional input: Place</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue=""
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (n === 0) {
                      setMastermindRows([{ word: "", greens: 0, yellows: 0 }]);
                      setMastermindResults(null);
                      return;
                    }
                    if (n === 3) {
                      const triplets = [
                        ["RANK", "SHOW", "TIME"],
                        ["LEAF", "ROCK", "WIND"],
                        ["KIND", "LOVE", "STAR"],
                        ["JUMP", "LIFE", "TASK"],
                        ["HOPE", "RUNS", "WALK"],
                        ["FISH", "PLAY", "WORD"],
                      ];
                      const pick = triplets[Math.floor(Math.random() * triplets.length)];
                      setMastermindRows(pick.map((w) => ({ word: w, greens: 0, yellows: 0 })));
                      setMastermindResults(null);
                    }
                  }}
                >
                  <option value="" disabled>—</option>
                  <option value="0">0</option>
                  <option value="3">3</option>
                </select>
                <span>strategic starting words into the solver.</span>
              </div>
            )}
            {mastermindRows.map((row, ri) => (
              <div key={ri} className="flex flex-wrap items-end gap-3 rounded-lg border-2 border-border p-3">

                <div>
                  <label className="mb-1 block text-sm font-medium">Guess #{ri + 1}</label>
                  <div className="flex gap-1.5">
                    {Array.from({ length: mastermindLen }).map((_, ti) => {
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
                            if (ti < mastermindLen - 1) focusMastermindTile(ri, ti + 1);
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
                  <label className="mb-1 block text-sm font-medium">correct</label>
                  <select
                    value={row.greens}
                    onChange={(e) =>
                      setMastermindRows((prev) =>
                        prev.map((r, i) => (i === ri ? { ...r, greens: Number(e.target.value) } : r)),
                      )
                    }
                    className="h-12 w-12 rounded border-2 border-green-600 bg-green-600 text-center font-mono text-lg font-bold text-white outline-none focus:ring-2 focus:ring-ring appearance-none px-0"
                    style={{ textAlignLast: "center" }}
                  >
                    {Array.from({ length: mastermindLen + 1 }, (_, n) => n).map((n) => (
                      <option key={n} value={n} className="bg-background text-foreground">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">wrong</label>
                  <select
                    value={row.yellows}
                    onChange={(e) =>
                      setMastermindRows((prev) =>
                        prev.map((r, i) => (i === ri ? { ...r, yellows: Number(e.target.value) } : r)),
                      )
                    }
                    className="h-12 w-12 rounded border-2 border-yellow-500 bg-yellow-500 text-center font-mono text-lg font-bold text-white outline-none focus:ring-2 focus:ring-ring appearance-none px-0"
                    style={{ textAlignLast: "center" }}
                  >
                    {Array.from({ length: mastermindLen + 1 }, (_, n) => n).map((n) => (
                      <option key={n} value={n} className="bg-background text-foreground">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                {mastermindRows.length > 1 && (
                  <Button onClick={() => removeMastermindRow(ri)} variant="outline" size="sm">×</Button>
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

        ) : mode === "sheetdoku" ? (
          (() => {
            const N = 5;
            const REGION_COLORS: Record<number, { bg: string; border: string; chip: string }> = {
              0: { bg: "bg-gray-400/20",    border: "border-gray-400",    chip: "bg-gray-400" },
              1: { bg: "bg-red-500/20",     border: "border-red-500",     chip: "bg-red-500" },
              2: { bg: "bg-blue-500/20",    border: "border-blue-500",    chip: "bg-blue-500" },
              3: { bg: "bg-emerald-500/20", border: "border-emerald-500", chip: "bg-emerald-500" },
              4: { bg: "bg-amber-500/20",   border: "border-amber-500",   chip: "bg-amber-500" },
              5: { bg: "bg-purple-500/20",  border: "border-purple-500",  chip: "bg-purple-500" },
              6: { bg: "bg-pink-500/20",    border: "border-pink-500",    chip: "bg-pink-500" },
            };
            const usedRegionsArr = Array.from(new Set(sdRegions.flat())).filter((r) => r !== 0).sort((a, b) => a - b);
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Paint region (click cells to assign)</div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((reg) => (
                      <button
                        key={reg}
                        onClick={() => setSdPaintRegion(reg)}
                        className={`flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-sm font-medium transition ${
                          sdPaintRegion === reg
                            ? `${REGION_COLORS[reg].border} ${REGION_COLORS[reg].bg}`
                            : "border-border bg-muted hover:bg-accent"
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 rounded-sm ${REGION_COLORS[reg].chip}`} />
                        {reg === 0 ? "Regionless" : `Region ${reg}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Grid (click to paint region, type 1–5 for a fixed value)</div>
                  <div className="inline-block">
                    {[0, 1, 2, 3, 4].map((r) => (
                      <div key={r} className="mt-1.5 flex gap-1.5 first:mt-0">
                        {[0, 1, 2, 3, 4].map((c) => {
                          const reg = sdRegions[r][c];
                          const col = REGION_COLORS[reg] || { bg: "bg-muted", border: "border-border", chip: "" };
                          const val = sdInitial[r][c];
                          return (
                            <div
                              key={c}
                              onClick={() => {
                                setSdRegions((prev) => prev.map((row, ri) => ri === r ? row.map((x, ci) => ci === c ? sdPaintRegion : x) : row));
                                setSdResults(null);
                              }}
                              className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded border-2 ${col.border} ${col.bg}`}
                              aria-label={`Cell row ${r + 1} col ${c + 1}, region ${reg}`}
                            >
                              <span className="absolute left-1 top-0.5 text-[10px] font-semibold text-muted-foreground">{reg}</span>
                              <input
                                value={val}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/[^1-5]/g, "").slice(-1);
                                  setSdInitial((prev) => prev.map((row, ri) => ri === r ? row.map((x, ci) => ci === c ? cleaned : x) : row));
                                  setSdResults(null);
                                }}
                                className="h-9 w-9 rounded bg-transparent text-center font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Value row ${r + 1} col ${c + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Region functions</div>
                  <div className="space-y-2">
                    {usedRegionsArr.map((reg) => {
                      const col = REGION_COLORS[reg];
                      const def = sdRegionDefs[reg] || { func: "SUM" as SheetdokuFunc, target: "" };
                      return (
                        <div key={reg} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className={`inline-block h-3 w-3 rounded-sm ${col?.chip || "bg-muted"}`} />
                          <span className="w-20">Region {reg}</span>
                          <select
                            value={def.func}
                            onChange={(e) => {
                              const f = e.target.value as SheetdokuFunc;
                              setSdRegionDefs((prev) => ({ ...prev, [reg]: { ...(prev[reg] || { target: "" }), func: f } }));
                              setSdResults(null);
                            }}
                            className="rounded border bg-background px-2 py-1"
                          >
                            <option value="SUM">SUM</option>
                            <option value="MIN">MIN</option>
                            <option value="MAX">MAX</option>
                            <option value="AVG">AVG</option>
                            <option value="PROD">PROD</option>
                            <option value="RANGE">RANGE</option>
                          </select>
                          <Input
                            value={def.target}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              setSdRegionDefs((prev) => ({ ...prev, [reg]: { ...(prev[reg] || { func: "SUM" as SheetdokuFunc }), target: v } }));
                              setSdResults(null);
                            }}
                            className="h-8 w-20 font-mono"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      setSdRegions(Array.from({ length: N }, () => Array(N).fill(0)));
                      setSdInitial(Array.from({ length: N }, () => Array(N).fill("")));
                      setSdResults(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Clear all
                  </Button>
                  <Button onClick={solveSheetdoku} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
              </div>
            );
          })()

        ) : mode === "wordiply" ? (

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Substring</label>
              <Input
                value={start}
                onChange={(e) => setStart(clamp(e.target.value))}
                maxLength={wordLength || 12}
                className="font-mono text-lg uppercase tracking-widest w-[12ch]"
              />
            </div>
            <div className="flex flex-nowrap gap-2">
              <Button onClick={randomize} variant="outline" size="sm">Randomize</Button>
              <Button
                onClick={() => { setStart(""); setPaths(null); setError(null); }}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
              <Button onClick={solve} disabled={solving} size="sm">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Start</label>
                <Input
                  value={start}
                  onChange={(e) => setStart(clamp(e.target.value))}
                  maxLength={Math.min(10, wordLength || 10)}
                  className="font-mono text-lg uppercase tracking-widest w-[10ch]"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 block text-sm font-medium invisible select-none" aria-hidden="true">.</label>
                <div className="flex h-10 items-center text-2xl font-bold text-muted-foreground">→</div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Goal{mode === "pivots" ? " (fixed)" : ""}
                </label>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(clamp(e.target.value))}
                  maxLength={Math.min(10, wordLength || 10)}
                  disabled={mode === "pivots"}
                  className="font-mono text-lg uppercase tracking-widest w-[10ch]"
                />
              </div>
            </div>
            <div className="flex flex-nowrap gap-2">
              <Button onClick={randomize} variant="outline" size="sm">Randomize</Button>
              <Button
                onClick={() => {
                  setStart("");
                  if (mode !== "pivots") setGoal("");
                  setPaths(null);
                  setError(null);
                }}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
              <Button onClick={solve} disabled={solving} size="sm">
                {solving ? "Solving..." : "Solve"}
              </Button>
            </div>
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
                  const hasSelection = selectedPaths.size > 0;
                  const indices = hasSelection
                    ? [...selectedPaths].sort((a, b) => a - b)
                    : paths.map((_, i) => i);
                  const items = indices.map((i) => {
                    const p = paths[i];
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
                aria-label={selectedPaths.size > 0 ? "Copy selected paths" : "Copy all paths"}
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> {selectedPaths.size > 0 ? "Copy" : "Copy all"}</>)}
              </button>
            </div>
            <ol className="space-y-3">
              {paths.slice(pagePaths * 50, pagePaths * 50 + 50).map((path, idx) => {
                const i = pagePaths * 50 + idx;
                const isSelected = selectedPaths.has(i);
                return (
                <li
                  key={i}
                  onClick={() => {
                    setSelectedPaths((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    });
                  }}
                  className={`flex cursor-pointer items-center rounded-lg border-2 bg-card p-4 font-mono text-card-foreground transition ${isSelected ? "border-yellow-500" : "border-border"}`}
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
                      <span
                        key={w}
                        className="rounded bg-muted px-2 py-1 tracking-widest"
                      >
                        {w}
                      </span>
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
                  <button
                    key={w}
                    type="button"
                    onClick={() => addWordleGuessFromAnswer(w)}
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w}
                  </button>
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
                        <span
                          key={w}
                          className="rounded bg-muted px-2 py-1 tracking-widest"
                        >
                          {w}
                        </span>
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
                  <button
                    key={w}
                    type="button"
                    onClick={() => addMastermindGuessFromAnswer(w)}
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w}
                  </button>
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
                  <button
                    key={w}
                    type="button"
                    onClick={() => addWordPeaksGuessFromAnswer(w)}
                    className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                  >
                    {w}
                  </button>
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
                  <span
                    key={w}
                    className="rounded bg-muted px-2 py-1 tracking-widest"
                  >
                    {w.toLowerCase()}
                  </span>
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
                      <button
                        type="button"
                        onClick={() => addWorGuessFromAnswer(w)}
                        className="rounded bg-muted px-2 py-1 font-semibold tracking-widest hover:bg-accent hover:text-accent-foreground"
                      >
                        {w}
                      </button>
                      <span className="text-muted-foreground">=</span>
                      <span className="rounded bg-muted px-2 py-1 tracking-widest">{a}</span>
                      <span className="text-muted-foreground">+</span>
                      <span className="rounded bg-muted px-2 py-1 tracking-widest">{b}</span>
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
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {dodekuResult.length}{dodekuResult.length === 1000 ? "+" : ""} {dodekuResult.length === 1 ? "solution" : "solutions"}
              </h2>
              <button
                onClick={() => {
                  const items = dodekuResult
                    .map((sol, i) => `#${i + 1}\n${sol.map((row) => row.map((c) => (c === "X" ? "X" : String(c))).join(" ")).join("\n")}`)
                    .join("\n\n");
                  copyText(`${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all solutions"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dodekuResult.slice(pageDodeku * 50, pageDodeku * 50 + 50).map((sol, idx) => {
                const i = pageDodeku * 50 + idx;
                return (
                  <li key={i} className="rounded-lg border bg-card p-3 text-card-foreground">
                    <div className="mb-2 text-xs text-muted-foreground">#{i + 1}</div>
                    <table className="border-collapse font-mono">
                      <tbody>
                        {sol.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => {
                              const isBlocked = cell === "X";
                              return (
                                <td
                                  key={c}
                                  className={`h-10 w-10 border border-border text-center text-base font-bold ${isBlocked ? "bg-foreground text-background" : "bg-muted text-foreground"}`}
                                >
                                  {isBlocked ? "X" : String(cell)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </li>
                );
              })}
            </ol>
            <Paginator page={pageDodeku} setPage={setPageDodeku} total={dodekuResult.length} perPage={50} />
          </section>
        )}

        {sdResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sdResults.length}{sdResults.length === 1000 ? "+" : ""} {sdResults.length === 1 ? "solution" : "solutions"}
              </h2>
              <button
                onClick={() => {
                  const items = sdResults
                    .map((sol, i) => `#${i + 1}\n${sol.map((row) => row.join(" ")).join("\n")}`)
                    .join("\n\n");
                  copyText(`${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all solutions"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sdResults.slice(pageSd * 20, pageSd * 20 + 20).map((sol, idx) => {
                const i = pageSd * 20 + idx;
                const REGION_COLORS: Record<number, { bg: string; border: string }> = {
                  0: { bg: "bg-gray-400/20",    border: "border-gray-400" },
                  1: { bg: "bg-red-500/20",     border: "border-red-500" },
                  2: { bg: "bg-blue-500/20",    border: "border-blue-500" },
                  3: { bg: "bg-emerald-500/20", border: "border-emerald-500" },
                  4: { bg: "bg-amber-500/20",   border: "border-amber-500" },
                  5: { bg: "bg-purple-500/20",  border: "border-purple-500" },
                  6: { bg: "bg-pink-500/20",    border: "border-pink-500" },
                };
                return (
                  <li key={i} className="rounded-lg border bg-card p-3 text-card-foreground">
                    <div className="mb-2 text-xs text-muted-foreground">#{i + 1}</div>
                    <div className="inline-block">
                      {sol.map((row, r) => (
                        <div key={r} className="mt-1 flex gap-1 first:mt-0">
                          {row.map((cell, c) => {
                            const reg = sdRegions[r][c];
                            const col = REGION_COLORS[reg] || { bg: "bg-muted", border: "border-border" };
                            return (
                              <div key={c} className={`flex h-10 w-10 items-center justify-center rounded border-2 ${col.border} ${col.bg} font-mono text-base font-bold`}>
                                {cell}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
            <Paginator page={pageSd} setPage={setPageSd} total={sdResults.length} perPage={20} />
          </section>
        )}





      </div>

    </div>
  );
}
