import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useState } from "react";
import { dodekuSolve, fibbleSolve, findAllShortestPaths, flippingLettersSolve, formatPivotsWord, getRandomWords, getSplitleOtherHalves, getSplitleStrategicWords, isValid5LetterWord, isValidJeffGoldblumWord, isValidNLetterWord, isValidShuntleWord, isValidSplitleHalf, isValidWord, isValidWrdlKey, jeffGoldblumLeSolve, marblessSolve, mastermindSolve, MODE_WORD_LENGTH, pivotsBracketRange, sheetdokuSolve, shuntleSolve, spellingBeeSolve, splitleP2Solve, splitleSolve, sudokuSolve, wordiplySearch, wordleSolve, wordPeaksSolve, worwordleSolve, worwordleSplit, wrdlSolve, type DodekuCell, type MarblessSolution, type Mode, type SheetdokuFunc, type SheetdokuRegionDef, type WordleColor, type WordPeaksDirection } from "@/lib/wordLadder";
import wordleStartingWords from "@/data/wordleStartingWords.json";
import flippableCommonWords from "@/data/flippableCommonWords.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { SudokuCopyBoard } from "@/components/sudoku-copy-controls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solver Sanctuary" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
  component: Index,
});

const SECTIONS: { id: "ladder" | "search" | "math" | "logic"; label: string }[] = [
  { id: "search", label: "Word search" },
  { id: "ladder", label: "Word ladder" },
  { id: "math", label: "Math" },
  { id: "logic", label: "Logic" },
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
  sudoku: { start: "", goal: "" },
  sudokuvariation: { start: "", goal: "" },
  shuntle: { start: "", goal: "" },
  splitle: { start: "", goal: "" },
  blunderwall: { start: "", goal: "" },
  doubledabble: { start: "", goal: "" },
  wrdl: { start: "", goal: "" },
  

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

const SHUNTLE_STARTING_PAIRS: [string, string][] = [
  ["ABSENT ", "PROUDLY"],
  [" ABSURD", "VIOLENT"],
  [" FRINGE", "WOMBATS"],
  ["FROZEN ", "QUICKLY"],
  ["MINDFUL", "GROWTH "],
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

const isEmptyGuessWord = (w: string): boolean => (w || "").replace(/\s+/g, "").length === 0;




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
  const [wrdlResults, setWrdlResults] = useState<[string, string[]][] | null>(null);
  const [pageWrdl, setPageWrdl] = useState(0);
  const [wrdlWordMap, setWrdlWordMap] = useState<Record<string, string[]> | null>(null);
  useEffect(() => {
    if (wrdlWordMap) return;
    let cancelled = false;
    fetch("/wrdlWords.json")
      .then((r) => r.json())
      .then((m: Record<string, string[]>) => { if (!cancelled) setWrdlWordMap(m); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [wrdlWordMap]);
  const [splitleResults, setSplitleResults] = useState<[string, string[]][] | null>(null);
  const [splitleStartingWords, setSplitleStartingWords] = useState<0 | 3>(0);
  const [splitleExpanded, setSplitleExpanded] = useState<Record<string, boolean>>({});
  const [splitleP1Error, setSplitleP1Error] = useState<string | null>(null);

  const [splitleP2Word, setSplitleP2Word] = useState<string>("");
  const [splitleP2Colors, setSplitleP2Colors] = useState<WordleColor[]>(["GREY","GREY","GREY","GREY","GREY"]);
  const [splitleP2Valid, setSplitleP2Valid] = useState<boolean | null>(null);
  const [splitleP2Guesses, setSplitleP2Guesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [splitleP2Results, setSplitleP2Results] = useState<[string, string][] | null>(null);
  const [splitleP2Solving, setSplitleP2Solving] = useState(false);
  const [splitleP2Error, setSplitleP2Error] = useState<string | null>(null);
  const [splitleP2Allowed, setSplitleP2Allowed] = useState<string[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (splitleP2Valid && splitleP2Word.length === 5) {
      getSplitleOtherHalves(splitleP2Word).then((m) => {
        if (!cancelled) setSplitleP2Allowed(Object.keys(m).map((k) => k.toUpperCase()));
      });
    } else {
      setSplitleP2Allowed(null);
    }
    return () => { cancelled = true; };
  }, [splitleP2Valid, splitleP2Word]);
  const [spellingBeeMiddle, setSpellingBeeMiddle] = useState("T");
  const [spellingBeeOthers, setSpellingBeeOthers] = useState("OWERAB");
  const [spellingBeeResults, setSpellingBeeResults] = useState<[number, string[]][] | null>(null);
  const [mastermindLen, setMastermindLen] = useState<4 | 5>(5);
  const [mastermindRows, setMastermindRows] = useState<{ word: string; greens: number; yellows: number }[]>([
    { word: "", greens: 0, yellows: 0 },
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
  const [flStartingWords, setFlStartingWords] = useState<0 | 1>(0);
  const [flLocked, setFlLocked] = useState<boolean>(false);
  // Double Dabble: 15 cells (3x5); positions 10 and 14 are faded/disabled. Each usable cell holds 2 distinct letters.
  const [ddKeys, setDdKeys] = useState<string[]>(Array(15).fill(""));
  const [ddLocked, setDdLocked] = useState<boolean>(false);
  const [ddError, setDdError] = useState<string | null>(null);
  const [ddPartitionedKeys, setDdPartitionedKeys] = useState<string[]>([]);
  const [ddWordMap, setDdWordMap] = useState<Record<string, string[]> | null>(null);
  const [ddLoadingWords, setDdLoadingWords] = useState<boolean>(false);
  const [ddGuesses, setDdGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [ddResults, setDdResults] = useState<Array<[string, string[]]> | null>(null);
  const [ddPerRowResults, setDdPerRowResults] = useState<string[][] | null>(null);
  const [ddSolveError, setDdSolveError] = useState<string | null>(null);

  const [jgStartingWord, setJgStartingWord] = useState<0 | 1>(0);
  

  const topPillRef = useRef<HTMLDivElement>(null);
  const [topPillWidth, setTopPillWidth] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = topPillRef.current;
    if (!el) return;
    const update = () => setTopPillWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);




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

  const applyFlStartingWords = (count: 0 | 1) => {
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
      const hasFlippable = flLetters.some((l, i) => flRevealed[i] && !!FL_FLIP_MAP[(l || "").toUpperCase()]);
      if (!hasFlippable) {
        setError("Mark at least one tile as flippable before locking.");
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
      setWorGuesses((prev) => [
        ...prev.filter((g) => !isEmptyGuessWord(g.word)),
        { word: pair[0], pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
        { word: pair[1], pattern: ["GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY", "GREY"] },
      ]);
      setWorResults(null);
    }
  };

  const [shuntleStartingWords, setShuntleStartingWords] = useState<0 | 2>(0);
  const applyShuntleStartingWords = (count: 0 | 2) => {
    setShuntleStartingWords(count);
    if (count === 2) {
      const pair = SHUNTLE_STARTING_PAIRS[Math.floor(Math.random() * SHUNTLE_STARTING_PAIRS.length)];
      setWordleGuesses((prev) => [
        ...prev.filter((g) => !isEmptyGuessWord(g.word)),
        { word: pair[0], pattern: Array(7).fill("GREY") as WordleColor[] },
        { word: pair[1], pattern: Array(7).fill("GREY") as WordleColor[] },
      ]);
      setWordleResults(null);
    }
  };

  const [wrdlStartingWords, setWrdlStartingWords] = useState<0 | 2 | 3>(0);
  const applyWrdlStartingWords = (count: 0 | 2 | 3) => {
    setWrdlStartingWords(count);
    const words = count === 2 ? ["CHRSM", "WLKNG"] : count === 3 ? ["BSHNG", "MPLFR", "DJCTV"] : [];
    if (words.length > 0) {
      setWordleGuesses((prev) => [
        ...prev.filter((g) => !isEmptyGuessWord(g.word)),
        ...words.map((w) => ({ word: w, pattern: Array(5).fill("GREY") as WordleColor[] })),
      ]);
      setWordleResults(null);
      setWrdlResults(null);
    }
  };

  const applySplitleStartingWords = async (count: 0 | 3) => {
    setSplitleStartingWords(count);
    if (count === 3) {
      const strategic = await getSplitleStrategicWords();
      if (strategic.length === 0) return;
      const triplet = strategic[Math.floor(Math.random() * strategic.length)];
      setWordleGuesses((prev) => [
        ...prev.filter((g) => !isEmptyGuessWord(g.word)),
        ...triplet.map((w) => ({ word: w.toUpperCase(), pattern: Array(5).fill("GREY") as WordleColor[] })),
      ]);
      setSplitleResults(null);
    }
  };


  const [marblessColumns, setMarblessColumns] = useState<string[][]>([
    ["I", "G", "H", "Y", "R"],
    ["B", "R", "N", "D", "O"],
  ]);
  const [marblessResults, setMarblessResults] = useState<MarblessSolution[] | null>(null);
  const [dodekuGrid, setDodekuGrid] = useState<string[][]>([
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ]);
  const [dodekuRowSums, setDodekuRowSums] = useState<string[]>(["", "", "", ""]);
  const [dodekuColSums, setDodekuColSums] = useState<string[]>(["", "", "", ""]);
  const [dodekuSelected, setDodekuSelected] = useState<{ kind: "pile"; value: string } | { kind: "cell"; r: number; c: number } | null>(null);
  const [dodekuResult, setDodekuResult] = useState<DodekuCell[][][] | null>(null);
  const [pageDodeku, setPageDodeku] = useState(0);
  const [bwWords, setBwWords] = useState<string[]>(Array(16).fill(""));
  const [bwLocked, setBwLocked] = useState(false);
  const [bwGuesses, setBwGuesses] = useState<{ word: string; tally: string }[]>([
    { word: "", tally: "-" },
    { word: "", tally: "-" },
    { word: "", tally: "-" },
    { word: "", tally: "-" },
  ]);
  const [bwResult, setBwResult] = useState<string[] | null>(null);
  const [bwStartingWords, setBwStartingWords] = useState<0 | 2>(0);

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
  const SUDOKU_REGIONS: number[][] = [
    [1,1,1,2,2,2,3,3,3],
    [1,1,1,2,2,2,3,3,3],
    [1,1,1,2,2,2,3,3,3],
    [4,4,4,5,5,5,6,6,6],
    [4,4,4,5,5,5,6,6,6],
    [4,4,4,5,5,5,6,6,6],
    [7,7,7,8,8,8,9,9,9],
    [7,7,7,8,8,8,9,9,9],
    [7,7,7,8,8,8,9,9,9],
  ];
  const WINDOKU_REGIONS: number[][] = [
    [1,6,6,6,1,7,7,7,1],
    [8,2,2,2,8,3,3,3,8],
    [8,2,2,2,8,3,3,3,8],
    [8,2,2,2,8,3,3,3,8],
    [1,6,6,6,1,7,7,7,1],
    [9,4,4,4,9,5,5,5,9],
    [9,4,4,4,9,5,5,5,9],
    [9,4,4,4,9,5,5,5,9],
    [1,6,6,6,1,7,7,7,1],
  ];
  const DISJOINT_REGIONS: number[][] = [
    [1,2,3,1,2,3,1,2,3],
    [4,5,6,4,5,6,4,5,6],
    [7,8,9,7,8,9,7,8,9],
    [1,2,3,1,2,3,1,2,3],
    [4,5,6,4,5,6,4,5,6],
    [7,8,9,7,8,9,7,8,9],
    [1,2,3,1,2,3,1,2,3],
    [4,5,6,4,5,6,4,5,6],
    [7,8,9,7,8,9,7,8,9],
  ];
  const SUDOKU_DEFAULT: string[][] = [
    ["8","","","","","","","",""],
    ["","","3","6","","","","",""],
    ["","7","","","9","","2","",""],
    ["","5","","","","7","","",""],
    ["","","","","4","5","7","",""],
    ["","","","1","","","","3",""],
    ["","","1","","","","","6","8"],
    ["","","8","5","","","","1",""],
    ["","9","","","","","4","",""],
  ];
  const [sudokuBoard, setSudokuBoard] = useState<string[][]>(SUDOKU_DEFAULT.map((r) => r.slice()));
  const [sudokuResults, setSudokuResults] = useState<number[][][] | null>(null);
  const [pageSudoku, setPageSudoku] = useState(0);
  const SUDOKU_EMPTY: string[][] = Array.from({ length: 9 }, () => Array(9).fill(""));
  const [sudokuVarBoard, setSudokuVarBoard] = useState<string[][]>(SUDOKU_EMPTY.map((r) => r.slice()));
  const [sudokuVarResults, setSudokuVarResults] = useState<number[][][] | null>(null);
  const [pageSudokuVar, setPageSudokuVar] = useState(0);
  const [sudokuVarKing, setSudokuVarKing] = useState(false);
  const [sudokuVarKnight, setSudokuVarKnight] = useState(false);
  const [sudokuVarDiagonal, setSudokuVarDiagonal] = useState(false);
  const [sudokuVarNonConsec, setSudokuVarNonConsec] = useState(false);
  const [sudokuVarWindoku, setSudokuVarWindoku] = useState(false);
  const [sudokuVarIrregular, setSudokuVarIrregular] = useState(false);
  const [sudokuVarDisjoint, setSudokuVarDisjoint] = useState(false);
  const [sudokuVarRegions, setSudokuVarRegions] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [sudokuVarPaintColor, setSudokuVarPaintColor] = useState<number>(1);
  const [selectedMarbless, setSelectedMarbless] = useState<Set<number>>(new Set());
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
  useEffect(() => { setPageWrdl(0); }, [wrdlResults]);
  useEffect(() => { setPageMM(0); }, [mastermindResults]);
  useEffect(() => { setPageWP(0); }, [wordPeaksResults]);

  useEffect(() => { setPageMarbless(0); setSelectedMarbless(new Set()); }, [marblessResults]);
  useEffect(() => { setPageWordiply(0); }, [wordiplyResults]);
  useEffect(() => { setPageBee(0); }, [spellingBeeResults]);
  useEffect(() => { setPageFl(0); }, [flResults]);
  useEffect(() => { setPageWor(0); }, [worResults]);
  useEffect(() => { setPageSd(0); }, [sdResults]);
  useEffect(() => { setPageSudoku(0); }, [sudokuResults]);
  useEffect(() => { setPageSudokuVar(0); }, [sudokuVarResults]);

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
    setWrdlResults(null);
    setSplitleResults(null);
    setSplitleExpanded({});
    setSpellingBeeResults(null);
    setMastermindResults(null);
    setWordPeaksResults(null);
    setFlResults(null);
    setWorResults(null);

    setMarblessResults(null);
    setDodekuResult(null);
    setSdResults(null);
    setSudokuResults(null);
    setSudokuVarResults(null);
    setBwResult(null);
    setError(null);
    setSplitleP1Error(null);
    setDdError(null);

    if (m === "fibble") {
      setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    } else if (m === "wordle" || m === "wrdl") {
      setWordleGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    } else if (m === "jeffgoldblum") {
      setWordleGuesses([{ word: "JEFFGOLDBLUM", pattern: Array(12).fill("GREY") as WordleColor[] }]);
      setJgStartingWord(0);
    } else if (m === "shuntle") {
      setWordleGuesses([{ word: "       ", pattern: Array(7).fill("GREY") as WordleColor[] }]);
    } else if (m === "splitle") {
      setWordleGuesses([{ word: "", pattern: Array(5).fill("GREY") as WordleColor[] }]);
      setSplitleStartingWords(0);
    } else if (m === "mastermind") {
      setMastermindLen(5);
      setMastermindRows([{ word: "", greens: 0, yellows: 0 }]);
    }
    const d = DEFAULTS[String(m)];
    setStart(d.start);
    setGoal(d.goal);
  };

  const solveDodeku = () => {
    setError(null);
    setDodekuResult(null);
    const flat = dodekuGrid.flat();
    const xCount = flat.filter((v) => v === "X").length;
    const numPlaced = flat.filter((v) => v !== "" && v !== "X").map((v) => parseInt(v, 10));
    if (xCount !== 4) {
      setError("Place all 4 X tiles into the grid.");
      return;
    }
    if (numPlaced.length < 3) {
      setError("Place at least 3 number tiles into the grid.");
      return;
    }
    const initial: DodekuCell[][] = dodekuGrid.map((row) =>
      row.map<DodekuCell>((v) => {
        if (v === "X") return "X";
        if (v === "") return 0;
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : 0;
      }),
    );
    const rs = dodekuRowSums.map((s) => (s.trim() === "" ? null : parseInt(s, 10)));
    const cs = dodekuColSums.map((s) => (s.trim() === "" ? null : parseInt(s, 10)));
    if (rs.every((v) => v === null)) {
      setError("Fill in at least one row sum.");
      return;
    }
    if (cs.every((v) => v === null)) {
      setError("Fill in at least one column sum.");
      return;
    }
    const allNumbers = [1,2,3,4,5,6,7,8,9,10,11,12];
    const tiles = allNumbers.filter((n) => !numPlaced.includes(n));
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

  const solveSudoku = () => {
    setError(null);
    setSudokuResults(null);
    const board: number[][] = sudokuBoard.map((row) =>
      row.map((v) => {
        const s = v.trim();
        if (!s) return 0;
        const n = parseInt(s, 10);
        return Number.isFinite(n) && n >= 1 && n <= 9 ? n : 0;
      }),
    );
    setSolving(true);
    setTimeout(() => {
      const res = sudokuSolve(board, SUDOKU_REGIONS);
      if (res.length === 0) setError("No solutions found.");
      else setSudokuResults(res);
      setSolving(false);
    }, 0);
  };

  const solveSudokuVariation = () => {
    setError(null);
    setSudokuVarResults(null);
    const board: number[][] = sudokuVarBoard.map((row) =>
      row.map((v) => {
        const s = v.trim();
        if (!s) return 0;
        const n = parseInt(s, 10);
        return Number.isFinite(n) && n >= 1 && n <= 9 ? n : 0;
      }),
    );
    let regions = SUDOKU_REGIONS;
    if (sudokuVarIrregular) {
      const counts = new Map<number, number>();
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        const v = sudokuVarRegions[r][c];
        if (!v) { setError("All cells must be painted with one of the 9 region colors."); return; }
        counts.set(v, (counts.get(v) || 0) + 1);
      }
      for (let k = 1; k <= 9; k++) {
        if ((counts.get(k) || 0) !== 9) { setError("Each of the 9 colored regions must contain exactly 9 cells."); return; }
      }
      regions = sudokuVarRegions;
    }
    setSolving(true);
    setTimeout(() => {
      const res = sudokuSolve(board, regions, 200, {
        king: sudokuVarKing,
        knight: sudokuVarKnight,
        diagonal: sudokuVarDiagonal,
        nonConsecutive: sudokuVarNonConsec,
        extraRegions: (() => {
          const layers: number[][][] = [];
          if (sudokuVarWindoku) layers.push(WINDOKU_REGIONS);
          if (sudokuVarDisjoint) layers.push(DISJOINT_REGIONS);
          return layers.length ? layers : undefined;
        })(),
      });
      if (res.length === 0) setError("No solutions found.");
      else setSudokuVarResults(res);
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
    const w = mode === "shuntle" ? word.toUpperCase().padEnd(7, " ").slice(0, 7) : word.toUpperCase();
    setWordleGuesses((prev) => [...prev, { word: w, pattern: Array(wordleTileLen).fill("GREY") as WordleColor[] }]);
    setWordleResults(null);
    setWrdlResults(null);
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




  const wordleTileLen = mode === "jeffgoldblum" ? 12 : mode === "shuntle" ? 7 : 5;

  const solveWordle = async () => {
    setError(null);
    setSplitleP1Error(null);
    setWordleResults(null);
    setWrdlResults(null);
    setSplitleResults(null);
    setSplitleExpanded({});
    const errFn = mode === "splitle" ? setSplitleP1Error : setError;
    for (const g of wordleGuesses) {
      if (mode === "shuntle") {
        const padded = g.word.toUpperCase().padEnd(7, " ").slice(0, 7);
        const letters = padded.replace(/ /g, "");
        if (letters.length < 4 || letters.length > 7) {
          errFn("Each guess must be 4-7 letters long.");
          return;
        }
        // Letters must be contiguous (no embedded spaces).
        if (!/^ *[A-Z]+ *$/.test(padded)) {
          errFn(`"${padded.replace(/ /g, "·")}" has spaces between letters; spaces are only allowed at the left and/or right.`);
          return;
        }
        if (!(await isValidShuntleWord(padded))) {
          errFn(`"${letters}" is not a valid Shuntle word.`);
          return;
        }
        continue;
      }
      const w = g.word.trim().toUpperCase();
      if (w.length !== wordleTileLen) {
        errFn(`Each guess must be exactly ${wordleTileLen} letters.`);
        return;
      }
      if (mode === "jeffgoldblum") {
        if (!(await isValidJeffGoldblumWord(w))) {
          errFn(`"${w}" is not a valid 12-letter English word.`);
          return;
        }
      } else if (mode === "splitle") {
        if (!(await isValidSplitleHalf(w))) {
          errFn(`"${w}" is not a valid Splitle half (must match the first or last 5 letters of some 10-letter English word).`);
          return;
        }
      } else if (mode === "wrdl") {
        if (!(await isValidWrdlKey(w))) {
          errFn(`"${w}" is not a valid Wrdl word.`);
          return;
        }
      } else if (!(await isValid5LetterWord(w))) {
        errFn(`"${w}" is not a valid 5-letter English word.`);
        return;
      }
    }
    setSolving(true);
    const normalized = wordleGuesses.map((g) => ({ word: g.word.toUpperCase(), pattern: g.pattern }));
    if (mode === "splitle") {
      const sres = await splitleSolve(normalized);
      if (sres.length === 0) setSplitleP1Error("No words match these constraints.");
      else setSplitleResults(sres);
      setSolving(false);
      return;
    }

    if (mode === "wrdl") {
      const wres = await wrdlSolve(normalized);
      if (wres.length === 0) setError("No words match these constraints.");
      else setWrdlResults(wres);
      setSolving(false);
      return;
    }

    const result =
      mode === "fibble" ? await fibbleSolve(normalized)
      : mode === "jeffgoldblum" ? await jeffGoldblumLeSolve(normalized)
      : mode === "shuntle" ? await shuntleSolve(normalized)
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
    const isSpace = ch === " ";
    const c = isSpace ? " " : ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setWordleGuesses((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const padded = g.word.padEnd(wordleTileLen, " ").slice(0, wordleTileLen).split("");
        padded[ti] = c || " ";
        const joined = padded.join("");
        // Preserve trailing spaces for shuntle so the user can mark space tiles.
        return { ...g, word: mode === "shuntle" ? joined : joined.replace(/ +$/, "") };
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
    const initialWord = mode === "shuntle" ? " ".repeat(7) : "";
    setWordleGuesses((prev) => [...prev, { word: initialWord, pattern: Array(wordleTileLen).fill("GREY") as WordleColor[] }]);
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
    const allowedSet = new Set<string>(letters);
    flLetters.forEach((l, i) => {
      const u = (l || "").trim().toUpperCase();
      if (u && flRevealed[i] && FL_FLIP_MAP[u]) allowedSet.add(FL_FLIP_MAP[u]);
    });
    const allowed = Array.from(allowedSet);
    for (const g of flGuesses) {
      const w = g.word.trim().toUpperCase();
      if (w.length !== 5) {
        setError("Each guess must be exactly 5 letters.");
        return;
      }
      for (const ch of w) {
        if (!allowedSet.has(ch)) {
          setError(`"${w}" uses "${ch.toLowerCase()}" which is not in the (expanded) letter bank.`);
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
            <h1 className="text-4xl font-bold tracking-tight">Solver Sanctuary</h1>
            <p className="mt-2 text-muted-foreground">
              Solvers built, puzzles beat.
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

        <div ref={topPillRef} className="mb-3 inline-flex rounded-md border bg-muted p-1">
          {SECTIONS.map((s) => {
            const isMath = mode === "dodeku" || mode === "sheetdoku" || mode === "blunderwall";
            const inSearch = mode === "wordle" || mode === "fibble" || mode === "spellingbee" || mode === "mastermind" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl";
            const inLogic = mode === "sudoku" || mode === "sudokuvariation";
            const inLadder = !isMath && !inSearch && !inLogic;
            const isActive = s.id === "math" ? isMath : s.id === "search" ? inSearch : s.id === "logic" ? inLogic : inLadder;
            return (
              <button
                key={s.id}
                onClick={() =>
                  s.id === "ladder"
                    ? switchMode(4)
                    : s.id === "search"
                      ? switchMode("wordle")
                      : s.id === "logic"
                        ? switchMode("sudoku")
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
          <div className="mb-6 flex rounded-md border bg-muted p-1" style={{ width: topPillWidth }}>
            {LADDER_MODES.map((m) => {
              const isActive =
                m.id === "classic"
                  ? mode === 4 || mode === 5 || mode === 6 || mode === "weaverx" || mode === "craftwords"
                  : mode === "splice" || mode === "pivots";
              return (
                <button
                  key={m.id}
                  onClick={() => m.id === "classic" ? switchMode(4) : switchMode("splice")}
                  className={`flex-1 rounded px-4 py-1.5 text-sm font-medium transition ${
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

        {(mode === "wordle" || mode === "fibble" || mode === "mastermind" || mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl") && (
          <div className="mb-6 flex rounded-md border bg-muted p-1" style={{ width: topPillWidth }}>
            {SEARCH_MODES.map((m) => {
              const isActive =
                m.id === "wordle"
                  ? mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl"
                  : mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "mastermind";

              return (
                <button
                  key={m.id}
                  onClick={() => m.id === "wordle" ? switchMode("wordle") : switchMode("spellingbee")}
                  className={`flex-1 rounded px-4 py-1.5 text-sm font-medium transition ${

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

        {(mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
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
              onClick={() => switchMode("doubledabble")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "doubledabble"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Double Dabble
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
              Jeff Goldblumle
            </button>
            <button
              onClick={() => switchMode("shuntle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "shuntle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shuntle
            </button>
            <button
              onClick={() => switchMode("splitle")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "splitle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Splitle
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
            <button
              onClick={() => switchMode("wrdl")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "wrdl"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wrdl
            </button>
          </div>
        )}

        {(mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "mastermind") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
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

        {(mode === "dodeku" || mode === "sheetdoku" || mode === "blunderwall") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("blunderwall")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "blunderwall"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blunderwall
            </button>
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

        {(mode === "sudoku" || mode === "sudokuvariation") && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode("sudoku")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "sudoku"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sudoku (original)
            </button>
            <button
              onClick={() => switchMode("sudokuvariation")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "sudokuvariation"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sudoku (variation)
            </button>
          </div>
        )}







        {(mode === 4 || mode === 5 || mode === 6 || mode === "weaverx" || mode === "craftwords") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
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
              <span>·</span>
              <a href="https://www.wrdlink.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wrd Link</a>
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
            <>
              <a href="https://www.nytimes.com/puzzles/spelling-bee" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Spelling Bee</a>
              <span> · </span>
              <a href="https://www.bostonglobe.com/games/word-flower/?p1=BGMenu_Sections" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Boston Globe</a>
            </>
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
          {mode === "blunderwall" && (
            <a href="https://bythomas.co.uk/blunderwall/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Blunderwall</a>
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
            <a href="https://jeffgoldblumle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jeff Goldblumle</a>
          )}
          {mode === "shuntle" && (
            <a href="https://shuntle.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Shuntle</a>
          )}
          {mode === "splitle" && (
            <a href="https://splitle.netlify.app/?daily" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Splitle</a>
          )}
          {mode === "doubledabble" && (
            <a href="https://double-dabble.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Double Dabble</a>
          )}
          {mode === "wrdl" && (
            <a href="https://wrdl-abae.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wrdl</a>
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
            <p>Permissible moves:</p>
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
            <p>Permissible moves:</p>
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

        {mode === "wrdl" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Just like Wordle, but all the words are 5-letters long after getting rid of their vowels. For this puzzle, "Y" is always considered a vowel.</p>
            <p>For example,</p>
            <ul className="list-disc pl-5">
              <li>CRMBL comes from CRUMBLE.</li>
              <li>NSGHT comes from INSIGHT.</li>
            </ul>
          </div>
        )}

        {mode === "jeffgoldblum" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter Wordle-style 12-letter guesses, but you only have 3 tries, and it also accepts "JEFFGOLDBLUM".
          </p>
        )}

        {mode === "shuntle" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Enter Wordle-style 4 to 7 letter guesses, with spaces on the left and/or right.
          </p>
        )}

        {mode === "shuntle" && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Optional input: Add</span>
            <select
              value={shuntleStartingWords}
              onChange={(e) => applyShuntleStartingWords(Number(e.target.value) as 0 | 2)}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              <option value={0}>0</option>
              <option value={2}>2</option>
            </select>
            <span className="text-muted-foreground">strategic starting words.</span>
          </div>
        )}

        {mode === "splitle" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Enter 5-letter Wordle-style guesses that match either half of a 10-letter English word.</p>
            <p>Examples:</p>
            <ul className="list-disc pl-5">
              <li>"BLACK" from "BLACKSMITH"</li>
              <li>"MENTS" from "AGREEMENTS"</li>
            </ul>
            <p>Note that this solver consists of two parts:</p>
            <ul className="list-disc pl-5">
              <li>Part 1: Find one half of the 10-letter word.</li>
              <li>Part 2: After finding the first half, find the other half.</li>
            </ul>
          </div>
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
        {mode === "blunderwall" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>There are sixteen 7-letter words. Find the secret word within 4 tries.</p>
            <p>Each try tells us how many letters of our guess are in the correct place within the secret word.</p>
          </div>
        )}
        {mode === "sheetdoku" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p><a href="https://www.sheetdoku.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sheetdoku</a></p>
            <p>Fill a 5×5 Latin square (each row and column contains 1–5 exactly once) partitioned into regions.</p>
            <p>For each region, set its function and target value.</p>
            <p>Pick a region color, then click cells to assign them. Enter any pre-filled cell values inside the grid.</p>
          </div>
        )}
        {mode === "sudoku" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>
              <a href="https://www.nytimes.com/puzzles/sudoku" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">New York Times</a>
              {" · "}
              <a href="https://www.netflix.com/tudum/puzzled/sudoku/daily" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Netflix</a>
              {" · "}
              <a href="https://www.bostonglobe.com/games/sudoku/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Boston Globe</a>
              {" · "}
              <a href="https://play.usatoday.com/sudoku/archive" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">USA today</a>
              {" · "}
              <a href="https://www.washingtonpost.com/games/sudoku/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">The Washington Post</a>
              {" · "}
              <a href="https://fun.chicagotribune.com/category/sudoku" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chicago Tribune</a>
            </p>
            <p>Fill the 9×9 grid so each row, column, and 3×3 region contains 1–9 exactly once.</p>
            <p>Enter any pre-filled cell values inside the grid, then click Solve.</p>
          </div>
        )}
        {mode === "sudokuvariation" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>A typical 9×9 Sudoku, but with more variations!</p>
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
            <p>Then enter Wordle-style guesses to filter the flippable 5-letter words.</p>
          </div>
        )}
        {mode === "doubledabble" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>Instead of having 26 keys, we are only given 13 keys, where each letter is bound to another letter.</p>
            <p>For example,</p>
            <ul className="list-disc pl-5">
              <li>[DV,CR,AW,IY,NO] could form the word DRAIN.</li>
              <li>[KS,EM,BT,JU,LP] could form the word SETUP.</li>
            </ul>
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
            <span className="text-muted-foreground">Optional input: Add</span>
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
              <div className="mb-2 text-sm font-medium">
                Insert 10 distinct letters into the letter bank. Click a tile if it is flippable.
              </div>
              <div className="grid grid-cols-5 gap-2 w-fit">
                {Array.from({ length: 10 }).map((_, i) => {
                  const upper = (flLetters[i] || "").toUpperCase();
                  const canFlip = !!FL_FLIP_MAP[upper];
                  const revealed = flRevealed[i] && canFlip;
                  return (
                    <div key={i} className="relative">
                      <input
                        id={`fl-bank-${i}`}
                        type="text"
                        value={(flLetters[i] || "").toLowerCase()}
                        readOnly={flLocked}
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
                          if (!canFlip) return;
                          setFlRevealed((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
                        }}
                        className={`h-12 w-12 rounded border-2 border-border bg-white text-center font-mono text-xl font-bold lowercase text-black outline-none focus:ring-2 focus:ring-ring ${canFlip && !flLocked ? "cursor-pointer" : ""}`}
                        aria-label={`Letter ${i + 1}`}
                      />
                      {revealed && (
                        <span
                          className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white"
                          aria-label="flippable"
                        />
                      )}
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

            {flLocked && (() => {
              const bank = flLetters.map((l) => (l || "").toLowerCase()).filter(Boolean);
              const extras: string[] = [];
              flLetters.forEach((l, i) => {
                const u = (l || "").toUpperCase();
                if (flRevealed[i] && FL_FLIP_MAP[u]) extras.push(FL_FLIP_MAP[u].toLowerCase());
              });
              const all = Array.from(new Set([...bank, ...extras]));
              const allUpper = all.map((c) => c.toUpperCase());
              const allowedSet = new Set(allUpper);
              const StartingFlippableWords = (flippableCommonWords as string[]).filter((w) =>
                w.split("").every((ch) => allowedSet.has(ch))
              );
              return (
                <div className="space-y-4">
                  {(
                    <div className="space-y-4 rounded-lg border bg-card p-4">
                      {StartingFlippableWords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span>Optional input: Add</span>
                        <select
                          value={flStartingWords}
                          onChange={(e) => {
                            const n = Number(e.target.value) as 0 | 1;
                            setFlStartingWords(n);
                            if (n === 1) {
                              const pick = StartingFlippableWords[Math.floor(Math.random() * StartingFlippableWords.length)];
                              setFlGuesses([{ word: pick.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                            } else {
                              setFlGuesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                            }
                            setFlResults(null);
                            setError(null);
                          }}
                          className="rounded border border-border bg-background px-2 py-1 text-sm"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                        </select>
                        <span>strategic starting words.</span>
                      </div>
                      )}
                      {flGuesses.map((g, gi) => (
                        <div key={gi} className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {Array.from({ length: 5 }).map((_, ti) => {
                              const rawChar = g.word[ti] || "";
                              const letter = rawChar && rawChar !== " " ? rawChar : "";
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
                                    const c = v.slice(-1);
                                    if (!allowedSet.has(c)) {
                                      setError(`"${c.toLowerCase()}" is not a valid letter input.`);
                                      return;
                                    }
                                    setError(null);
                                    setFlLetter(gi, ti, c);
                                    if (ti < 4) focusFlTile(gi, ti + 1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      if (!letter && ti > 0) { e.preventDefault(); focusFlTile(gi, ti - 1); }
                                    } else if (e.key === "ArrowLeft") {
                                      e.preventDefault(); focusFlTile(gi, ti - 1);
                                    } else if (e.key === "ArrowRight") {
                                      e.preventDefault(); focusFlTile(gi, ti + 1);
                                    } else if (e.key === " " || e.key === "Enter") {
                                      e.preventDefault(); cycleFlTile(gi, ti);
                                    }
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
                            setError(null);
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
                  )}
                </div>
              );
            })()}
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
        ) : mode === "doubledabble" ? (
          (() => {
            const DISABLED = new Set([10, 14]);
            const parseCell = (v: string) => v.toLowerCase().replace(/[^a-z]/g, "").slice(0, 2);
            const wordToKeys = (word: string, keys: string[]): string[] | null => {
              const out: string[] = [];
              for (const ch of word.toUpperCase()) {
                const k = keys.find((kk) => kk.includes(ch));
                if (!k) return null;
                out.push(k);
              }
              return out;
            };
            const computePattern = (guessKeys: string[], secretKeys: string[]): WordleColor[] => {
              const n = guessKeys.length;
              const res: WordleColor[] = Array(n).fill("GREY") as WordleColor[];
              const remaining: (string | null)[] = [...secretKeys];
              for (let i = 0; i < n; i++) {
                if (guessKeys[i] === secretKeys[i]) {
                  res[i] = "GREEN";
                  remaining[i] = null;
                }
              }
              for (let i = 0; i < n; i++) {
                if (res[i] === "GREEN") continue;
                const idx = remaining.indexOf(guessKeys[i]);
                if (idx !== -1) {
                  res[i] = "YELLOW";
                  remaining[idx] = null;
                }
              }
              return res;
            };
            const tryLock = async () => {
              const cells = ddKeys.map((v, i) => (DISABLED.has(i) ? "" : parseCell(v)));
              for (let i = 0; i < 15; i++) {
                if (DISABLED.has(i)) continue;
                const c = cells[i];
                if (c.length !== 2) { setDdError("Every key must contain exactly 2 letters."); return; }
                if (c[0] === c[1]) { setDdError("The two letters in a key must be distinct."); return; }
              }
              const all = cells.filter(Boolean).join("");
              if (new Set(all).size !== 26 || all.length !== 26) {
                setDdError("All 26 letters must appear exactly once across the 13 keys.");
                return;
              }
              const partitioned = cells.filter(Boolean).map((c) => c.toUpperCase());
              setDdPartitionedKeys(partitioned);
              setDdError(null);
              setDdLocked(true);
              setDdLoadingWords(true);
              try {
                const res = await fetch("https://raw.githubusercontent.com/nahiphog/BigBigSolver/refs/heads/main/all_5_letter_words.txt");
                const text = await res.text();
                const words = text.split(/\r?\n/).map((w) => w.trim().toUpperCase()).filter((w) => w.length === 5 && /^[A-Z]+$/.test(w));
                const map: Record<string, string[]> = {};
                for (const w of words) {
                  const keys = wordToKeys(w, partitioned);
                  if (!keys) continue;
                  const tuple = keys.join(",");
                  (map[tuple] ||= []).push(w);
                }
                setDdWordMap(map);
              } catch {
                setDdSolveError("Failed to load 5-letter word list.");
              } finally {
                setDdLoadingWords(false);
              }
            };
            const solve = () => {
              setDdSolveError(null);
              setDdResults(null);
              setDdPerRowResults(null);
              if (!ddWordMap) { setDdSolveError("Word list not loaded yet."); return; }
              const normalized: { keys: string[]; pattern: WordleColor[] }[] = [];
              for (const g of ddGuesses) {
                const w = g.word.trim().toUpperCase();
                if (w.length !== 5) { setDdSolveError("Each guess must be exactly 5 letters."); return; }
                const keys = wordToKeys(w, ddPartitionedKeys);
                if (!keys) { setDdSolveError(`"${w}" contains letters outside the locked keys.`); return; }
                normalized.push({ keys, pattern: g.pattern });
              }
              const matches: Array<[string, string[]]> = [];
              for (const [tuple, words] of Object.entries(ddWordMap)) {
                const secretKeys = tuple.split(",");
                let ok = true;
                for (const g of normalized) {
                  const p = computePattern(g.keys, secretKeys);
                  if (p.some((c, i) => c !== g.pattern[i])) { ok = false; break; }
                }
                if (ok) matches.push([tuple, words]);
              }
              matches.sort((a, b) => b[1].length - a[1].length);
              // Per-row cumulative matches
              const perRow: string[][] = [];
              for (let ri = 0; ri < normalized.length; ri++) {
                const subset = normalized.slice(0, ri + 1);
                const rowWords: string[] = [];
                for (const [tuple, words] of Object.entries(ddWordMap)) {
                  const secretKeys = tuple.split(",");
                  let ok = true;
                  for (const g of subset) {
                    const p = computePattern(g.keys, secretKeys);
                    if (p.some((c, i) => c !== g.pattern[i])) { ok = false; break; }
                  }
                  if (ok) rowWords.push(...words);
                }
                perRow.push(rowWords);
              }
              setDdPerRowResults(perRow);
              if (matches.length === 0) setDdSolveError("No words match these constraints.");
              else setDdResults(matches);
            };
            const setDdGuessLetter = (gi: number, ti: number, ch: string) => {
              const c = ch.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
              setDdGuesses((prev) => prev.map((g, i) => {
                if (i !== gi) return g;
                const padded = g.word.padEnd(5, " ").slice(0, 5).split("");
                padded[ti] = c || " ";
                return { ...g, word: padded.join("").replace(/ +$/, "") };
              }));
              setDdResults(null);
              setDdPerRowResults(null);
            };
            const cycleDdTile = (gi: number, ti: number) => {
              setDdGuesses((prev) => prev.map((g, i) => {
                if (i !== gi) return g;
                const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
                const next = [...g.pattern];
                next[ti] = order[(order.indexOf(g.pattern[ti]) + 1) % 3];
                return { ...g, pattern: next };
              }));
              setDdResults(null);
              setDdPerRowResults(null);
            };

            return (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    Part 1: Enter the 13 keys. Each key holds 2 distinct letters. All 26 letters must be used exactly once.
                  </div>
                  <div className="grid w-fit grid-cols-5 gap-2">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const disabled = DISABLED.has(i);
                      if (disabled) {
                        return (
                          <div
                            key={i}
                            className="h-16 w-16 rounded border-2 border-dashed border-border bg-muted/40 opacity-40"
                            aria-hidden
                          />
                        );
                      }
                      return (
                        <input
                          key={i}
                          id={`dd-key-${i}`}
                          type="text"
                          value={ddKeys[i] || ""}
                          readOnly={ddLocked}
                          maxLength={2}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => {
                            if (ddLocked) return;
                            const v = parseCell(e.target.value);
                            setDdKeys((prev) => { const n = [...prev]; n[i] = v; return n; });
                            setDdError(null);
                            if (v.length === 2) {
                              const order = [0,1,2,3,4,5,6,7,8,9,11,12,13];
                              const pos = order.indexOf(i);
                              const nxt = order[pos + 1];
                              if (nxt !== undefined) {
                                setTimeout(() => {
                                  const el = document.getElementById(`dd-key-${nxt}`) as HTMLInputElement | null;
                                  el?.focus();
                                  el?.select();
                                }, 0);
                              }
                            }
                          }}
                          placeholder="?"
                          aria-label={`Key ${i + 1}`}
                          className="h-16 w-16 rounded border-2 border-border bg-white text-center font-mono text-xl font-bold lowercase text-black outline-none placeholder:font-normal placeholder:text-gray-300 focus:ring-2 focus:ring-ring"
                        />
                      );
                    })}
                  </div>
                  {ddError && <p className="text-sm text-red-600">{ddError}</p>}
                  <div className="flex gap-3">
                    {!ddLocked && (
                      <Button
                        onClick={() => { setDdKeys(Array(15).fill("")); setDdError(null); }}
                        variant="outline"
                        size="lg"
                      >
                        Clear all
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (ddLocked) {
                          setDdLocked(false);
                          setDdError(null);
                          setDdResults(null);
                          setDdSolveError(null);
                          setDdGuesses([{ word: "", pattern: ["GREY","GREY","GREY","GREY","GREY"] }]);
                          setDdPerRowResults(null);
                        } else {
                          void tryLock();
                        }
                      }}
                      variant={ddLocked ? "outline" : "default"}
                      size="lg"
                    >
                      {ddLocked ? "Unlock these keys" : "Lock these keys"}
                    </Button>
                  </div>
                </div>

                {ddLocked && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="text-sm font-medium">
                      Part 2: Enter Wordle-style guesses. Feedback colors apply to the keys used.
                      {ddLoadingWords && <span className="ml-2 text-muted-foreground">Loading word list…</span>}
                    </div>
                    {ddGuesses.map((g, gi) => (
                      <div key={gi} className="flex flex-wrap items-center gap-3">
                        <div className="flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, ti) => {
                            const letter = g.word[ti] && g.word[ti] !== " " ? g.word[ti] : "";
                            const keyStr = letter ? (ddPartitionedKeys.find((k) => k.includes(letter)) || letter) : "";
                            const color = g.pattern[ti];
                            const colorClass =
                              color === "GREEN" ? "bg-green-600 text-white border-green-600 caret-white"
                              : color === "YELLOW" ? "bg-yellow-500 text-white border-yellow-500 caret-white"
                              : "bg-muted text-foreground border-border caret-foreground";
                            return (
                              <input
                                key={ti}
                                id={`dd-tile-${gi}-${ti}`}
                                type="text"
                                value={keyStr}
                                onMouseDown={(e) => {
                                  if (document.activeElement === e.currentTarget) {
                                    e.preventDefault();
                                    cycleDdTile(gi, ti);
                                  }
                                }}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => {
                                  const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                                  if (!v) { setDdGuessLetter(gi, ti, ""); return; }
                                  // Take the last typed letter that isn't already part of the current key
                                  let picked = v.slice(-1);
                                  for (let k = v.length - 1; k >= 0; k--) {
                                    if (!keyStr.includes(v[k])) { picked = v[k]; break; }
                                  }
                                  setDdGuessLetter(gi, ti, picked);
                                  if (ti < 4) document.getElementById(`dd-tile-${gi}-${ti + 1}`)?.focus();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !letter && ti > 0) {
                                    e.preventDefault();
                                    document.getElementById(`dd-tile-${gi}-${ti - 1}`)?.focus();
                                  } else if (e.key === "Enter") {
                                    e.preventDefault();
                                    cycleDdTile(gi, ti);
                                  }
                                }}
                                className={`flex h-16 w-16 items-center justify-center rounded border-2 text-center font-mono text-lg font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${colorClass}`}
                              />
                            );
                          })}
                        </div>
                        {ddGuesses.length > 1 && (
                          <Button onClick={() => { setDdGuesses((prev) => prev.filter((_, i) => i !== gi)); setDdResults(null); setDdPerRowResults(null); }} variant="outline" size="sm">×</Button>
                        )}
                        {(() => {
                          const wordUp = g.word.toUpperCase();
                          if (wordUp.length !== 5 || !ddWordMap) return null;
                          const ks = wordToKeys(wordUp, ddPartitionedKeys);
                          if (!ks) return null;
                          const matches = ddWordMap[ks.join(",")] || [];
                          return (
                            <div className="flex flex-col font-mono text-sm text-muted-foreground">
                              {matches.length === 0
                                ? <span>no matches</span>
                                : matches.map((m) => <span key={m}>{m}</span>)}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => { setDdGuesses((prev) => [...prev, { word: "", pattern: ["GREY","GREY","GREY","GREY","GREY"] }]); setDdPerRowResults(null); setDdResults(null); }}
                        variant="outline" size="lg"
                      >
                        Add guess
                      </Button>
                      <Button
                        onClick={() => { setDdGuesses([{ word: "", pattern: ["GREY","GREY","GREY","GREY","GREY"] }]); setDdResults(null); setDdPerRowResults(null); setDdSolveError(null); }}
                        variant="outline" size="lg"
                      >
                        Reset
                      </Button>
                      <Button onClick={solve} disabled={ddLoadingWords} size="lg">Solve</Button>
                    </div>
                    {ddSolveError && <p className="text-sm text-red-600">{ddSolveError}</p>}
                    {ddResults && (
                      <section className="mt-4">
                        <h2 className="mb-2 text-base font-semibold">
                          {ddResults.reduce((s, [, ws]) => s + ws.length, 0)} possible {ddResults.reduce((s, [, ws]) => s + ws.length, 0) === 1 ? "word" : "words"}
                          {" "}across {ddResults.length} keystroke {ddResults.length === 1 ? "pattern" : "patterns"}
                        </h2>
                        <div className="overflow-hidden rounded-lg border bg-card">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                              <tr>
                                <th className="w-1/2 px-3 py-2 font-semibold">Exact keystrokes</th>
                                <th className="px-3 py-2 font-semibold">All such words</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {ddResults.map(([tuple, words]) => {
                                const keys = tuple.split(",");
                                const formatted = `[${keys.join(", ")}]`;
                                const addAsGuess = () => {
                                  const w = words[0];
                                  const newRow = { word: w, pattern: ["GREY","GREY","GREY","GREY","GREY"] as WordleColor[] };
                                  setDdGuesses((prev) => {
                                    const emptyIdx = prev.findIndex((g) => !g.word.trim());
                                    if (emptyIdx !== -1) return prev.map((g, i) => (i === emptyIdx ? newRow : g));
                                    return [...prev, newRow];
                                  });
                                  setDdResults(null);
                                  setDdPerRowResults(null);
                                };
                                return (
                                  <tr key={tuple}>
                                    <td className="px-3 py-2 font-mono">
                                      <button
                                        type="button"
                                        onClick={addAsGuess}
                                        className="inline-block rounded-md border-2 border-gray-400 bg-gray-100 px-3 py-1.5 text-left text-gray-800 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                        title={`Add ${words[0]} as a guess`}
                                      >
                                        {formatted}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 font-mono">{words.join(", ")}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            );
          })()

        ) : (mode === "wordle" || mode === "fibble" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "wrdl") ? (

          <>
          {mode === "splitle" && (
            <p className="text-sm font-medium mb-2">Part 1: Find one half of the 10-letter word.</p>
          )}
          <div className={mode === "splitle" ? "space-y-4 border-2 border-border rounded-lg p-4" : "space-y-4"}>
            {mode === "splitle" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Optional input: Add</span>
                <select
                  value={splitleStartingWords}
                  onChange={(e) => applySplitleStartingWords(Number(e.target.value) as 0 | 3)}
                  className="rounded border bg-background px-2 py-1 text-sm"
                >
                  <option value={0}>0</option>
                  <option value={3}>3</option>
                </select>
                <span className="text-muted-foreground">strategic starting words.</span>
              </div>
            )}
            {mode !== "jeffgoldblum" && mode !== "shuntle" && mode !== "splitle" && mode !== "wrdl" && (
              <div className="flex items-center gap-2 text-sm">
                <span>Optional input: Add</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue="0"
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (n === 0) return;
                    const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                    if (!sheet || sheet.length === 0) return;
                    const row = sheet[Math.floor(Math.random() * sheet.length)];
                    const newGuesses = row.slice(0, n).map((w) => ({ word: w.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] }));
                    setWordleGuesses((prev) => [...prev.filter((g) => !isEmptyGuessWord(g.word)), ...newGuesses]);
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
            {mode === "jeffgoldblum" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Optional input: Add</span>
                <select
                  value={jgStartingWord}
                  onChange={(e) => {
                    const v = Number(e.target.value) as 0 | 1;
                    setJgStartingWord(v);
                    if (v === 1) {
                      const word = Math.random() < 0.5 ? "PRAISEWORTHY" : "WISECRACKING";
                      setWordleGuesses((prev) => [...prev.filter((g) => !isEmptyGuessWord(g.word)), { word, pattern: Array(12).fill("GREY") as WordleColor[] }]);
                    }
                  }}
                  className="rounded border border-border bg-background px-2 py-1"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                </select>
                <span className="text-muted-foreground">word into the solver.</span>
              </div>
            )}
            {mode === "wrdl" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Optional input: Add</span>
                <select
                  value={wrdlStartingWords}
                  onChange={(e) => applyWrdlStartingWords(Number(e.target.value) as 0 | 2 | 3)}
                  className="rounded border bg-background px-2 py-1 text-sm"
                >
                  <option value={0}>0</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
                <span className="text-muted-foreground">strategic starting words.</span>
              </div>
            )}
            {wordleGuesses.map((g, gi) => (
              <div key={gi} className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: wordleTileLen }).map((_, ti) => {
                    const rawChar = g.word[ti] || "";
                    const isSpaceTile = mode === "shuntle" && rawChar === " ";
                    const letter = rawChar && rawChar !== " " ? rawChar : "";
                    const displayValue = isSpaceTile ? "·" : letter;
                    const color = g.pattern[ti];
                    const colorClass =
                      color === "GREEN"
                        ? "bg-green-600 text-white border-green-600 caret-white"
                        : color === "YELLOW"
                          ? "bg-yellow-500 text-white border-yellow-500 caret-white"
                          : "bg-muted text-foreground border-border caret-foreground";
                    const tileSize = mode === "jeffgoldblum" ? "h-9 w-9 text-base" : "h-12 w-12 text-xl";
                    const spaceClass = isSpaceTile ? " opacity-40" : "";
                    return (
                      <input
                        key={ti}
                        id={`wordle-tile-${gi}-${ti}`}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        value={displayValue}
                        aria-label={`Guess ${gi + 1} tile ${ti + 1}: ${color}${isSpaceTile ? " (space)" : ""}`}
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
                            if (!letter && !isSpaceTile && ti > 0) {
                              e.preventDefault();
                              focusTile(gi, ti - 1);
                            }
                          } else if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            focusTile(gi, ti - 1);
                          } else if (e.key === "ArrowRight") {
                            e.preventDefault();
                            focusTile(gi, ti + 1);
                          } else if (e.key === " ") {
                            e.preventDefault();
                            if (mode === "shuntle") {
                              setGuessLetter(gi, ti, " ");
                              if (ti < wordleTileLen - 1) focusTile(gi, ti + 1);
                            } else {
                              cycleTile(gi, ti);
                            }
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            cycleTile(gi, ti);
                          }
                        }}
                        className={`flex items-center justify-center rounded border-2 text-center font-mono font-bold uppercase outline-none transition focus:ring-2 focus:ring-ring ${tileSize} ${colorClass}${spaceClass}`}
                      />
                    );
                  })}
                </div>
                {wordleGuesses.length > 1 && (
                  <Button onClick={() => removeGuessRow(gi)} variant="outline" size="sm">×</Button>
                )}
                {mode === "wrdl" && (() => {
                  const wordUp = g.word.toUpperCase();
                  if (wordUp.length !== 5 || !wrdlWordMap) return null;
                  const matches = wrdlWordMap[wordUp];
                  if (!matches) return <span className="font-mono text-sm text-muted-foreground">no matches</span>;
                  return (
                    <div className="flex flex-col font-mono text-sm text-muted-foreground">
                      {matches.map((m) => <span key={m}>{m}</span>)}
                    </div>
                  );
                })()}
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
                    setJgStartingWord(0);
                  } else if (mode === "shuntle") {
                    setWordleGuesses([{ word: "       ", pattern: Array(7).fill("GREY") as WordleColor[] }]);
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
            {mode === "splitle" && splitleP1Error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {splitleP1Error}
              </div>
            )}
            {mode === "splitle" && splitleResults && (() => {

              const sorted = [...splitleResults].sort((a, b) => b[1].length - a[1].length);
              return (
                <section className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">
                      {sorted.length} possible {sorted.length === 1 ? "half" : "halves"}
                    </h2>
                    <button
                      onClick={() => {
                        const lines = sorted.map(([k, ws]) => `${k} | ${ws.join(", ")}`).join("\n");
                        copyText(`${sorted.length} possible ${sorted.length === 1 ? "half" : "halves"}:\n${lines}\n\nSolved via ${window.location.href}.`);
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                      aria-label="Copy all halves"
                    >
                      {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                    </button>
                  </div>
                  <div className="rounded-lg border bg-card divide-y">
                    {sorted.map(([key, words]) => (
                      <div key={key} className="p-3 font-mono text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => addWordleGuessFromAnswer(key)}
                            className="rounded bg-muted px-2 py-1 font-bold tracking-widest hover:bg-accent hover:text-accent-foreground"
                          >
                            {key}
                          </button>
                          <span className="text-muted-foreground">|</span>
                          <span>{words.join(", ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>
          {mode === "splitle" && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Part 2: After finding the first half, find the other half.</p>
              <div className="border-2 border-border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Input one half of the 10-letter word.</p>
                <div className="flex gap-1.5">
                  {[0,1,2,3,4].map((i) => {
                    const ch = splitleP2Word[i] || "";
                    const invalid = splitleP2Valid === false;
                    return (
                      <input
                        key={i}
                        id={`splitle-p2-green-${i}`}
                        value={ch}
                        onChange={(e) => {
                          const c = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                          const arr = splitleP2Word.padEnd(5, " ").split("");
                          arr[i] = c || " ";
                          const next = arr.join("").replace(/ +$/, "");
                          setSplitleP2Word(next);
                          setSplitleP2Guesses([{ word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
                          setSplitleP2Results(null);
                          setSplitleP2Error(null);
                          if (c && i < 4) {
                            const el = document.getElementById(`splitle-p2-green-${i + 1}`) as HTMLInputElement | null;
                            el?.focus();
                            el?.select();
                          }
                          if (next.length === 5 && next.indexOf(" ") === -1) {
                            isValidSplitleHalf(next).then((ok) => setSplitleP2Valid(ok));
                          } else {
                            setSplitleP2Valid(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !ch && i > 0) {
                            const el = document.getElementById(`splitle-p2-green-${i - 1}`) as HTMLInputElement | null;
                            el?.focus();
                          }
                        }}
                        maxLength={1}
                        className={`h-12 w-12 rounded border-2 text-center text-lg font-bold uppercase text-white bg-green-600 ${invalid ? "border-red-500" : "border-green-600"} focus:outline-none focus:ring-2 focus:ring-green-400`}
                      />
                    );
                  })}
                </div>
                <div className="flex gap-1.5">
                  {[0,1,2,3,4].map((i) => {
                    const ch = splitleP2Word[i] || "";
                    const color = splitleP2Colors[i];
                    const bg = color === "GREEN" ? "bg-green-600 border-green-600" : color === "YELLOW" ? "bg-yellow-500 border-yellow-500" : "bg-gray-500 border-gray-500";
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
                          const nextC = order[(order.indexOf(color) + 1) % 3];
                          const arr = [...splitleP2Colors];
                          arr[i] = nextC;
                          setSplitleP2Colors(arr);
                        }}
                        className={`h-12 w-12 rounded border-2 text-center text-lg font-bold uppercase text-white ${bg}`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
                {splitleP2Valid === false && (
                  <p className="text-xs text-red-600">Not a valid Splitle half.</p>
                )}
                {splitleP2Valid && (
                  <div className="pt-3 border-t border-border space-y-3">
                    <p className="text-sm font-medium">Solve for the other half (empty rows are ignored):</p>
                    {splitleP2Guesses.map((g, gi) => {
                      const rowInvalid = g.word.length === 5 && splitleP2Allowed !== null && !splitleP2Allowed.includes(g.word.toUpperCase());
                      return (
                      <div key={gi} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          {[0,1,2,3,4].map((i) => {
                            const ch = g.word[i] || "";
                            const color = g.pattern[i];
                            const bg = color === "GREEN" ? "bg-green-600 border-green-600" : color === "YELLOW" ? "bg-yellow-500 border-yellow-500" : "bg-gray-500 border-gray-500";
                            const borderInvalid = rowInvalid ? "ring-2 ring-red-500" : "";
                            const cycle = () => {
                              const order: WordleColor[] = ["GREY", "YELLOW", "GREEN"];
                              const nextC = order[(order.indexOf(color) + 1) % 3];
                              const nextP = [...g.pattern];
                              nextP[i] = nextC;
                              const next = [...splitleP2Guesses];
                              next[gi] = { ...g, pattern: nextP };
                              setSplitleP2Guesses(next);
                            };
                            return (
                              <input
                                key={i}
                                id={`splitle-p2-solve-${gi}-${i}`}
                                type="text"
                                autoComplete="off"
                                value={ch}
                                onMouseDown={(e) => {
                                  if (document.activeElement === e.currentTarget) {
                                    e.preventDefault();
                                    cycle();
                                  }
                                }}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => {
                                  const c = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                                  const arr = (g.word.padEnd(5, " ").split(""));
                                  arr[i] = c || " ";
                                  const nextWord = arr.join("").replace(/ +$/, "");
                                  const next = [...splitleP2Guesses];
                                  next[gi] = { ...g, word: nextWord };
                                  setSplitleP2Guesses(next);
                                  setSplitleP2Error(null);
                                  if (c && i < 4) {
                                    const el = document.getElementById(`splitle-p2-solve-${gi}-${i + 1}`) as HTMLInputElement | null;
                                    el?.focus();
                                    el?.select();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !ch && i > 0) {
                                    const el = document.getElementById(`splitle-p2-solve-${gi}-${i - 1}`) as HTMLInputElement | null;
                                    el?.focus();
                                  } else if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    cycle();
                                  }
                                }}
                                maxLength={1}
                                className={`h-12 w-12 rounded border-2 text-center text-lg font-bold uppercase text-white outline-none ${bg} ${borderInvalid} focus:ring-2 focus:ring-blue-400`}
                              />
                            );
                          })}
                        </div>
                        {splitleP2Guesses.length > 1 && (
                          <Button
                            onClick={() => {
                              setSplitleP2Guesses(splitleP2Guesses.filter((_, i) => i !== gi));
                              setSplitleP2Results(null);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            ×
                          </Button>
                        )}
                        </div>
                        {rowInvalid && (
                          <p className="text-xs text-red-600">"{g.word}" is not a valid other half for "{splitleP2Word}".</p>
                        )}
                      </div>
                      );
                    })}
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => {
                          setSplitleP2Guesses([...splitleP2Guesses, { word: "", pattern: ["GREY","GREY","GREY","GREY","GREY"] }]);
                        }}
                        variant="outline"
                      >
                        Add guess
                      </Button>
                      <Button
                        onClick={() => {
                          setSplitleP2Word("");
                          setSplitleP2Colors(["GREY","GREY","GREY","GREY","GREY"]);
                          setSplitleP2Valid(null);
                          setSplitleP2Guesses([{ word: "", pattern: ["GREY","GREY","GREY","GREY","GREY"] }]);
                          setSplitleP2Results(null);
                          setSplitleP2Error(null);
                        }}
                        variant="outline"
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={async () => {
                          setSplitleP2Error(null);
                          const allowed = await import("@/lib/wordLadder").then((m) => m.getSplitleOtherHalves(splitleP2Word));
                          const allowedKeys = Object.keys(allowed);
                          const normalized = splitleP2Guesses.filter((g) => g.word.length > 0);
                          for (const g of normalized) {
                            if (g.word.length !== 5 || !allowedKeys.includes(g.word.toUpperCase())) {
                              setSplitleP2Error(`"${g.word}" is not a valid other half for "${splitleP2Word}".`);
                              return;
                            }
                          }
                          setSplitleP2Solving(true);
                           try {
                             const mirrored = { word: splitleP2Word.toUpperCase(), pattern: splitleP2Colors };
                             const allGuesses = [mirrored, ...normalized];
                             const res = await splitleP2Solve(splitleP2Word, allGuesses);
                             setSplitleP2Results(res);
                           } finally {
                             setSplitleP2Solving(false);
                           }
                        }}
                        disabled={splitleP2Solving}
                      >
                        {splitleP2Solving ? "Solving..." : "Solve"}
                      </Button>
                    </div>
                    {splitleP2Error && (
                      <p className="text-xs text-red-600">{splitleP2Error}</p>
                    )}
                    {splitleP2Results && (
                      <section className="mt-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h2 className="text-base font-semibold">
                            {splitleP2Results.length} possible {splitleP2Results.length === 1 ? "solution" : "solutions"}
                          </h2>
                          {splitleP2Results.length > 0 && (
                            <button
                              onClick={() => {
                                const lines = splitleP2Results.map(([h, f]) => `${h} | ${f}`).join("\n");
                                copyText(`${splitleP2Results.length} possible ${splitleP2Results.length === 1 ? "solution" : "solutions"}:\n${lines}\n\nSolved via ${window.location.href}.`);
                              }}
                              className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                              aria-label="Copy all solutions"
                            >
                              {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                            </button>
                          )}
                        </div>
                        {splitleP2Results.length > 0 && (
                          <div className="rounded-lg border bg-card divide-y">
                            {splitleP2Results.map(([half, full]) => (
                              <div key={half + full} className="p-3 font-mono text-sm">
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSplitleP2Guesses((prev) => {
                                        const kept = prev.filter((g) => g.word.length > 0);
                                        return [...kept, { word: half.toUpperCase(), pattern: ["GREY","GREY","GREY","GREY","GREY"] as WordleColor[] }];
                                      });
                                      setSplitleP2Results(null);
                                      setSplitleP2Error(null);
                                    }}
                                    className="rounded bg-muted px-2 py-1 font-bold tracking-widest hover:bg-accent hover:text-accent-foreground"
                                  >
                                    {half}
                                  </button>
                                  <span className="text-muted-foreground">|</span>
                                  <span className="tracking-widest">{full}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          </>

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
                  if (c && !isMiddle) {
                    // Clockwise outer order: 0(top), 1(UR), 2(LR), 4(bottom), 5(LL), 6(UL)
                    const cwOrder = [0, 1, 2, 4, 5, 6];
                    const pos = cwOrder.indexOf(i);
                    const othersArr = spellingBeeOthers.padEnd(6, " ").split("");
                    const idxNow = i < 3 ? i : i - 1;
                    othersArr[idxNow] = c;
                    // find next empty in clockwise order
                    let target: number | null = null;
                    for (let step = 1; step <= cwOrder.length; step++) {
                      const cand = cwOrder[(pos + step) % cwOrder.length];
                      const candIdx = cand < 3 ? cand : cand - 1;
                      if (!othersArr[candIdx] || othersArr[candIdx] === " ") { target = cand; break; }
                    }
                    if (target === null) target = 3; // middle
                    const next = document.getElementById(`bee-tile-${target}`) as HTMLInputElement | null;
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
                <span>Optional input: Add</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue=""
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                    if (!sheet || sheet.length === 0) return;
                    const row = sheet[Math.floor(Math.random() * sheet.length)];
                    const additions = row.slice(0, n).map((w) => ({ word: w.toUpperCase(), greens: 0, yellows: 0 }));
                    setMastermindRows((prev) => [...prev.filter((r) => !isEmptyGuessWord(r.word)), ...additions]);
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
                <span>Optional input: Add</span>
                <select
                  className="rounded border border-border bg-background px-2 py-1"
                  defaultValue=""
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (n === 0) return;
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
                      const additions = pick.map((w) => ({ word: w, greens: 0, yellows: 0 }));
                      setMastermindRows((prev) => [...prev.filter((r) => !isEmptyGuessWord(r.word)), ...additions]);
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
                <div className="flex gap-3">
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
          (() => {
            const flat = dodekuGrid.flat();
            const xPlaced = flat.filter((v) => v === "X").length;
            const numsPlaced = new Set(flat.filter((v) => v !== "" && v !== "X"));
            // Fixed 2x8 pile layout: row 0 = X,X,X,X,1,2,3,4 ; row 1 = 5..12
            const pileLayout: string[] = ["X","X","X","X","1","2","3","4","5","6","7","8","9","10","11","12"];
            const isSlotUsed = (idx: number, val: string) => {
              if (val === "X") return idx < xPlaced; // first xPlaced X-slots are used
              return numsPlaced.has(val);
            };
            const placeTile = (r: number, c: number, value: string) => {
              setDodekuResult(null);
              setDodekuGrid((prev) => prev.map((row, ri) => ri === r ? row.map((x, ci) => ci === c ? value : x) : row));
            };
            const clearCell = (r: number, c: number) => {
              setDodekuResult(null);
              setDodekuGrid((prev) => prev.map((row, ri) => ri === r ? row.map((x, ci) => ci === c ? "" : x) : row));
            };
            const onPileClick = (val: string, used: boolean) => {
              if (used) return;
              if (dodekuSelected && dodekuSelected.kind === "pile" && dodekuSelected.value === val) {
                setDodekuSelected(null);
              } else {
                setDodekuSelected({ kind: "pile", value: val });
              }
            };
            const onCellClick = (r: number, c: number) => {
              const existing = dodekuGrid[r][c];
              if (dodekuSelected) {
                if (dodekuSelected.kind === "pile") {
                  if (existing !== "") {
                    // Replace: clear existing then place
                    placeTile(r, c, dodekuSelected.value);
                  } else {
                    placeTile(r, c, dodekuSelected.value);
                  }
                  setDodekuSelected(null);
                } else {
                  const sr = dodekuSelected.r, sc = dodekuSelected.c;
                  if (sr === r && sc === c) {
                    setDodekuSelected(null);
                    return;
                  }
                  const moving = dodekuGrid[sr][sc];
                  setDodekuResult(null);
                  setDodekuGrid((prev) => prev.map((row, ri) => row.map((x, ci) => {
                    if (ri === sr && ci === sc) return existing;
                    if (ri === r && ci === c) return moving;
                    return x;
                  })));
                  setDodekuSelected(null);
                }
              } else {
                if (existing !== "") {
                  setDodekuSelected({ kind: "cell", r, c });
                }
              }
            };
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm font-medium">Tile pile (click a tile, then click a cell)</div>
                  <div className="inline-grid grid-cols-8 gap-1.5 rounded-md border border-dashed border-border bg-muted/30 p-2">
                    {pileLayout.map((t, i) => {
                      const used = isSlotUsed(i, t);
                      const isX = t === "X";
                      const isSelected = !used && dodekuSelected?.kind === "pile" && dodekuSelected.value === t && (t !== "X" || i === xPlaced);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onPileClick(t, used || (t === "X" && i !== xPlaced))}
                          disabled={used || (t === "X" && i !== xPlaced)}
                          className={`flex h-10 w-10 items-center justify-center rounded border-2 font-mono text-base font-bold transition ${used ? "border-dashed border-border bg-transparent text-muted-foreground/30" : isX ? "bg-foreground text-background border-border" : "bg-background text-foreground border-border"} ${isSelected ? "ring-2 ring-ring" : ""} ${t === "X" && i !== xPlaced && !used ? "opacity-40" : ""}`}
                          aria-label={`Pile tile ${t}`}
                        >
                          {used ? "" : t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm font-medium">Grid (click a tile to select, click a cell to place)</div>
                  <div className="inline-block">
                    {[0, 1, 2, 3].map((r) => (
                      <div key={r} className="mt-1.5 flex gap-1.5 first:mt-0">
                        {[0, 1, 2, 3].map((c) => {
                          const v = dodekuGrid[r][c];
                          const isBlocked = v === "X";
                          const isFilled = v !== "";
                          const isSelected = dodekuSelected?.kind === "cell" && dodekuSelected.r === r && dodekuSelected.c === c;
                          return (
                            <div
                              key={c}
                              onClick={() => onCellClick(r, c)}
                              onContextMenu={(e) => { e.preventDefault(); if (isFilled) clearCell(r, c); }}
                              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded border-2 border-border text-center font-mono text-lg font-bold ${isBlocked ? "bg-foreground text-background" : isFilled ? "bg-background text-foreground" : "bg-muted text-muted-foreground"} ${isSelected ? "ring-2 ring-ring" : ""}`}
                              aria-label={`Cell row ${r + 1} col ${c + 1}`}
                            >
                              {v}
                            </div>
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
                  <p className="mt-2 text-xs text-muted-foreground">Tip: right-click a placed tile to remove it.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      setDodekuGrid([["","","",""],["","","",""],["","","",""],["","","",""]]);
                      setDodekuRowSums(["","","",""]);
                      setDodekuColSums(["","","",""]);
                      setDodekuResult(null);
                      setDodekuSelected(null);
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
            );
          })()

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
                    {[1, 2, 3, 4, 5, 6, 0].map((reg) => (
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

        ) : mode === "blunderwall" ? (
          (() => {
            const cleanWords = bwWords.map((w) => w.trim().toUpperCase()).filter((w) => w.length === 7);
            const canLock = cleanWords.length === 16 && new Set(cleanWords).size === 16;
            const wordOptionLabels = ["(First word)", "(Second word)", "(Third word)", "(Fourth word)"];
            const compareTwo = (a: string, b: string) =>
              a.split("").reduce((acc, ch, i) => acc + (ch === b[i] ? 1 : 0), 0);
            const resetBw = () => {
              setBwGuesses([
                { word: "", tally: "-" },
                { word: "", tally: "-" },
                { word: "", tally: "-" },
                { word: "", tally: "-" },
              ]);
              setBwResult(null);
            };
            const solveBw = () => {
              setError(null);
              const dict: Record<string, number> = {};
              for (const g of bwGuesses) {
                if (g.word && g.tally !== "-") {
                  dict[g.word] = parseInt(g.tally, 10);
                }
              }
              const filtered = cleanWords.filter((w) =>
                Object.entries(dict).every(([dw, t]) => compareTwo(w, dw) === t),
              );
              setBwResult(filtered);
            };
            const chooseStrategicPair = (): [string, string] | null => {
              let maxLetters = 0;
              let bestPairs: [string, string][] = [];
              for (let i = 0; i < cleanWords.length; i++) {
                for (let j = i + 1; j < cleanWords.length; j++) {
                  const a = cleanWords[i], b = cleanWords[j];
                  const size = new Set((a + b).split("")).size;
                  if (size > maxLetters) {
                    maxLetters = size;
                    bestPairs = [[a, b]];
                  } else if (size === maxLetters) {
                    bestPairs.push([a, b]);
                  }
                }
              }
              if (bestPairs.length === 0) return null;
              return bestPairs[Math.floor(Math.random() * bestPairs.length)];
            };
            const applyStartingWords = (n: 0 | 2) => {
              setBwStartingWords(n);
              if (n === 0) {
                resetBw();
                return;
              }
              const pair = chooseStrategicPair();
              const base = [
                { word: "", tally: "-" },
                { word: "", tally: "-" },
                { word: "", tally: "-" },
                { word: "", tally: "-" },
              ];
              if (pair) {
                base[0] = { word: pair[0], tally: "-" };
                base[1] = { word: pair[1], tally: "-" };
              }
              setBwGuesses(base);
              setBwResult(null);
            };
            return (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-sm font-medium">
                    {bwLocked ? "Locked words" : "Insert the 16 seven-letter words"}
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-[14rem]">
                    {bwWords.map((w, i) => (
                      bwLocked ? (
                        <div key={i} className="rounded border bg-muted px-3 py-1.5 text-sm font-mono">
                          {cleanWords[i] ?? ""}
                        </div>
                      ) : (
                        <Input
                          key={i}
                          value={w}
                          maxLength={7}
                          placeholder={`Word ${i + 1}`}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 7);
                            setBwWords((prev) => prev.map((x, idx) => (idx === i ? v : x)));
                          }}
                          className="font-mono uppercase placeholder:normal-case"
                        />
                      )
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!bwLocked && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setBwWords(Array(16).fill(""))}
                      >
                        Clear all
                      </Button>
                    )}
                    <Button
                      size="lg"
                      disabled={!bwLocked && !canLock}
                      onClick={() => {
                        if (bwLocked) {
                          setBwLocked(false);
                          setBwResult(null);
                          setBwStartingWords(0);
                        } else {
                          setBwLocked(true);
                          resetBw();
                          setBwStartingWords(0);
                        }
                      }}
                    >
                      {bwLocked ? "Unlock these words" : "Lock these words"}
                    </Button>
                  </div>
                  {!bwLocked && !canLock && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Enter 16 distinct 7-letter words to lock.
                    </p>
                  )}
                </div>

                {bwLocked && (
                  <>
                    <div className="hidden">
                      <select
                        value={bwStartingWords}
                        onChange={(e) => applyStartingWords(Number(e.target.value) as 0 | 2)}
                      >
                        <option value={0}>0</option>
                        <option value={2}>2</option>
                      </select>
                    </div>


                    <div>
                      <table className="w-full max-w-md border-collapse text-sm">
                        <colgroup>
                          <col style={{ width: "35%" }} />
                          <col style={{ width: "25%" }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-center font-medium">Chosen word</th>
                            <th className="p-2 text-center font-medium">Correct places</th>

                          </tr>
                        </thead>
                        <tbody>
                          {bwGuesses.map((g, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-2 text-center">
                                <select
                                  value={g.word}
                                  onChange={(e) => {
                                    setBwGuesses((prev) =>
                                      prev.map((x, idx) => (idx === i ? { ...x, word: e.target.value } : x)),
                                    );
                                    setBwResult(null);
                                  }}
                                  className="w-full rounded border bg-background px-2 py-1 text-center"
                                >
                                  <option value="">{wordOptionLabels[i]}</option>
                                  {cleanWords.map((w) => (
                                    <option key={w} value={w}>{w}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-center">
                                <select
                                  value={g.tally}
                                  onChange={(e) => {
                                    setBwGuesses((prev) =>
                                      prev.map((x, idx) => (idx === i ? { ...x, tally: e.target.value } : x)),
                                    );
                                    setBwResult(null);
                                  }}
                                  className="w-full rounded border bg-background px-2 py-1 text-center"
                                >
                                  {["-", "0", "1", "2", "3", "4", "5", "6", "7"].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}

                        </tbody>
                      </table>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" onClick={resetBw}>Reset</Button>
                        <Button onClick={solveBw}>Solve</Button>
                      </div>
                    </div>

                    {bwResult && (
                      <div className="rounded-lg border-2 border-border p-4">
                        <h2 className="mb-2 text-lg font-semibold">
                          {bwResult.length} possible {bwResult.length === 1 ? "answer" : "answers"}
                        </h2>
                        {bwResult.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {bwResult.map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => {
                                  setBwGuesses((prev) => {
                                    const targetIdx = prev.findIndex((r) => !r.word);
                                    if (targetIdx === -1) return prev;
                                    return prev.map((r, i) =>
                                      i === targetIdx ? { ...r, word: w } : r,
                                    );
                                  });
                                  setBwResult(null);
                                }}
                                className="inline-block rounded-md border-2 border-gray-400 bg-gray-100 px-3 py-1.5 font-mono text-sm text-gray-800 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No words match those constraints.</p>
                        )}
                      </div>
                    )}

                  </>
                )}
              </div>
            );
          })()



        ) : (mode === "sudoku" || mode === "sudokuvariation") ? (
          (() => {
            const isVar = mode === "sudokuvariation";
            const REGION_BG: Record<number, string> = {
              1: "bg-red-500/20",
              2: "bg-blue-500/20",
              3: "bg-emerald-500/20",
              4: "bg-amber-500/20",
              5: "bg-purple-500/20",
              6: "bg-pink-500/20",
              7: "bg-cyan-500/20",
              8: "bg-orange-500/20",
              9: "bg-lime-500/20",
            };
            const board = isVar ? sudokuVarBoard : sudokuBoard;
            const setBoard = isVar ? setSudokuVarBoard : setSudokuBoard;
            const clearResults = () => (isVar ? setSudokuVarResults(null) : setSudokuResults(null));
            const onSolve = isVar ? solveSudokuVariation : solveSudoku;
            const regionsForCells = isVar && sudokuVarIrregular ? sudokuVarRegions : SUDOKU_REGIONS;
            const paintCell = (r: number, c: number) => {
              if (!(isVar && sudokuVarIrregular)) return;
              if (sudokuVarPaintColor === 0) return;
              setSudokuVarRegions((prev) => prev.map((rr, ri) => ri === r ? rr.map((x, ci) => ci === c ? sudokuVarPaintColor : x) : rr));
              clearResults();
            };
            return (
              <div className="space-y-4">
                {isVar && (
                  <div className="space-y-2 text-sm">
                    {[
                      { state: sudokuVarKing, set: setSudokuVarKing, label: "Anti-king", desc: "Cells separated by a chess king's move cannot contain the same digit." },
                      { state: sudokuVarKnight, set: setSudokuVarKnight, label: "Anti-knight", desc: "Cells separated by a chess knight's move cannot contain the same digit." },
                      { state: sudokuVarDiagonal, set: setSudokuVarDiagonal, label: "Diagonal", desc: "The two main diagonals contain the digits 1 through 9 exactly once each." },
                      { state: sudokuVarDisjoint, set: setSudokuVarDisjoint, label: "Disjoint groups", desc: "Digits cannot repeat relative to their respective positions in the 3×3 boxes." },
                      { state: sudokuVarIrregular, set: setSudokuVarIrregular, label: "Irregular", desc: "Each colored region contains each digit from 1-9 exactly once." },
                      { state: sudokuVarNonConsec, set: setSudokuVarNonConsec, label: "Non-consecutive", desc: "Consecutive digits may not be orthogonally adjacent to each other.", beta: true },
                      { state: sudokuVarWindoku, set: setSudokuVarWindoku, label: "Windoku", desc: "In addition to normal Sudoku rules. The digits 1 through 9 must each appear exactly once in each of the four additional boxes." },
                    ].map((opt) => (
                      <label key={opt.label} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opt.state}
                          onChange={(e) => {
                            opt.set(e.target.checked);
                            if (opt.label === "Irregular") {
                              setSudokuVarRegions(Array.from({ length: 9 }, () => Array(9).fill(0)));
                            }
                            clearResults();
                          }}
                          className="mt-1"
                        />
                        <span><span className="font-medium">{opt.label}:</span> <span className="text-muted-foreground">{opt.desc}</span>{(opt as { beta?: boolean }).beta && (<span title="This feature is experimental, it might cause your browser to lag. Proceed with caution." className="ml-1 cursor-help text-amber-600 font-semibold">(BETA)</span>)}</span>
                      </label>
                    ))}
                    {sudokuVarIrregular && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs text-muted-foreground">Paint region:</span>
                        {[1,2,3,4,5,6,7,8,9].map((k) => (
                          <button
                            key={k}
                            onClick={() => setSudokuVarPaintColor((prev) => prev === k ? 0 : k)}
                            className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-bold ${REGION_BG[k]} ${sudokuVarPaintColor === k ? "ring-2 ring-foreground" : "border-border"}`}
                            aria-label={`Paint with region ${k}`}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="mb-2 flex flex-wrap gap-3">
                    <SudokuCopyBoard board={board} />
                  </div>
                  <div className="mb-2 text-sm font-medium">Grid (type 1–9; leave blank for empty){isVar && sudokuVarIrregular ? " · click cells to paint" : ""}</div>
                  <div className="relative inline-block border-[3px] border-black dark:border-white">
                    {board.map((row, r) => (
                      <div key={r} className="flex">
                        {row.map((val, c) => {
                          const reg = regionsForCells[r][c];
                          const bg = isVar ? (reg ? (REGION_BG[reg] || "bg-muted") : "bg-muted") : "bg-background";
                          let extra = "";
                          if (!isVar) {
                            if (c === 2 || c === 5) extra += " border-r-[3px] border-r-black dark:border-r-white";
                            if (r === 2 || r === 5) extra += " border-b-[3px] border-b-black dark:border-b-white";
                          }
                          return (
                            <div
                              key={c}
                              onClick={() => paintCell(r, c)}
                              className={`flex h-10 w-10 items-center justify-center border border-border ${bg}${extra}`}
                            >
                              <input
                                value={val}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/[^1-9]/g, "").slice(-1);
                                  setBoard((prev) => prev.map((rr, ri) => ri === r ? rr.map((x, ci) => ci === c ? cleaned : x) : rr));
                                  clearResults();
                                  if (cleaned !== "") {
                                    const next = r * 9 + c + 1;
                                    if (next < 81) {
                                      const nr = Math.floor(next / 9), nc = next % 9;
                                      setTimeout(() => {
                                        const el = document.querySelector(`input[aria-label="Cell row ${nr + 1} col ${nc + 1}"]`) as HTMLInputElement | null;
                                        el?.focus();
                                        el?.select();
                                      }, 0);
                                    }
                                  }
                                }}
                                className="h-9 w-9 rounded bg-transparent text-center font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Cell row ${r + 1} col ${c + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {isVar && sudokuVarDiagonal && (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                      >
                        <line x1="0" y1="0" x2="100" y2="100" stroke="rgb(56 189 248 / 0.6)" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
                        <line x1="0" y1="100" x2="100" y2="0" stroke="rgb(56 189 248 / 0.6)" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
                      </svg>
                    )}
                    {!isVar && (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 9 9"
                      >
                        <line x1="3" y1="0" x2="3" y2="9" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                        <line x1="6" y1="0" x2="6" y2="9" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                        <line x1="0" y1="3" x2="9" y2="3" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                        <line x1="0" y1="6" x2="9" y2="6" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                      </svg>
                    )}
                    {isVar && sudokuVarWindoku && (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 9 9"
                      >
                        {[[1,1],[1,5],[5,1],[5,5]].map(([r, c], i) => (
                          <rect key={i} x={c} y={r} width={3} height={3} fill="none" stroke="currentColor" strokeDasharray="0.3 0.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
                        ))}
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">

                  <Button
                    onClick={() => {
                      setBoard(Array.from({ length: 9 }, () => Array(9).fill("")));
                      if (isVar && sudokuVarIrregular) {
                        setSudokuVarRegions(Array.from({ length: 9 }, () => Array(9).fill(0)));
                      }
                      clearResults();
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Clear all
                  </Button>
                  <Button onClick={onSolve} disabled={solving} size="lg">
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

        {error && mode !== "splitle" && (
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
                      const shown = display;
                      return (
                        <span key={j} className="inline-block whitespace-nowrap">
                          <span className="font-semibold tracking-widest">{shown}</span>
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
                    {mode === "shuntle"
                      ? w.split("").map((ch, i) => (
                          <span key={i} className={ch === " " ? "text-muted-foreground/60" : ""}>
                            {ch === " " ? "·" : ch}
                          </span>
                        ))
                      : w}
                  </button>
                ))}
              </div>
            </div>
            <Paginator page={pageWordle} setPage={setPageWordle} total={wordleResults.length} />
          </section>
        )}

        {wrdlResults && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {wrdlResults.length} possible {wrdlResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  const lines = wrdlResults.map(([k, ws]) => `${k} | ${ws.join(", ")}`).join("\n");
                  copyText(`${wrdlResults.length} possible ${wrdlResults.length === 1 ? "answer" : "answers"}:\n${lines}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Wrdl word</th>
                    <th className="px-4 py-2 text-left font-semibold">Its original word</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...wrdlResults].sort((a, b) => b[1].length - a[1].length).slice(pageWrdl * 50, pageWrdl * 50 + 50).map(([key, words]) => (
                    <tr key={key} className="font-mono">
                      <td className="px-4 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => addWordleGuessFromAnswer(key)}
                          className="rounded bg-muted px-2 py-1 font-bold tracking-widest hover:bg-accent hover:text-accent-foreground"
                        >
                          {key}
                        </button>
                      </td>
                      <td className="px-4 py-2 align-top">{words.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginator page={pageWrdl} setPage={setPageWrdl} total={wrdlResults.length} />
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
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      const up = w.toUpperCase();
                      setFlGuesses((prev) => {
                        const emptyIdx = prev.findIndex((g) => !g.word.trim());
                        const row = { word: up, pattern: ["GREY","GREY","GREY","GREY","GREY"] as WordleColor[] };
                        if (emptyIdx !== -1) return prev.map((g, i) => (i === emptyIdx ? row : g));
                        return [...prev, row];
                      });
                    }}
                    className="rounded bg-muted px-2 py-1 tracking-widest transition hover:bg-accent hover:text-accent-foreground"
                    title={`Add ${w.toUpperCase()} as a guess`}
                  >
                    {w.toLowerCase()}
                  </button>
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
                  const hasSel = selectedMarbless.size > 0;
                  const indices = hasSel
                    ? [...selectedMarbless].sort((a, b) => a - b)
                    : marblessResults.map((_, i) => i);
                  const items = indices
                    .map((i) => {
                      const s = marblessResults[i];
                      return `${i + 1}. ${s.words.join(" ")} · moves: ${s.moves.join(",")}`;
                    })
                    .join("\n");
                  copyText(`${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label={selectedMarbless.size > 0 ? "Copy selected solutions" : "Copy all solutions"}
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> {selectedMarbless.size > 0 ? "Copy" : "Copy all"}</>)}
              </button>
            </div>
            <ol className="space-y-4">
              {marblessResults.slice(pageMarbless * 50, pageMarbless * 50 + 50).map((sol, idx) => {
                const i = pageMarbless * 50 + idx;
                const isSelected = selectedMarbless.has(i);
                return (
                <li
                  key={i}
                  onClick={() => {
                    setSelectedMarbless((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    });
                  }}
                  className={`cursor-pointer rounded-lg border-2 bg-card p-4 text-card-foreground transition ${isSelected ? "border-yellow-500" : "border-border"}`}
                >
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

        {(() => {
          const REGION_BG: Record<number, string> = {
            1: "bg-red-500/20",
            2: "bg-blue-500/20",
            3: "bg-emerald-500/20",
            4: "bg-amber-500/20",
            5: "bg-purple-500/20",
            6: "bg-pink-500/20",
            7: "bg-cyan-500/20",
            8: "bg-orange-500/20",
            9: "bg-lime-500/20",
          };
          const perPage = 10;
          const renderSudokuResults = (
            results: number[][][],
            page: number,
            setPage: (n: number) => void,
            colored: boolean,
          ) => (
            <section className="mt-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {results.length}{results.length === 200 ? "+" : ""} {results.length === 1 ? "solution" : "solutions"}
                </h2>
                <button
                  onClick={() => {
                    const items = results
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
                {results.slice(page * perPage, page * perPage + perPage).map((sol, idx) => {
                  const i = page * perPage + idx;
                  return (
                    <li key={i} className="rounded-lg border bg-card p-3 text-card-foreground">
                      <div className="mb-2 text-xs text-muted-foreground">#{i + 1}</div>
                      <div className="relative inline-block border-[3px] border-black dark:border-white">
                        {sol.map((row, r) => (
                          <div key={r} className="flex">
                            {row.map((cell, c) => {
                              const regs = colored && sudokuVarIrregular ? sudokuVarRegions : SUDOKU_REGIONS;
                              const reg = regs[r][c];
                              const bg = colored ? (REGION_BG[reg] || "bg-muted") : "bg-background";
                              let extra = "";
                              if (!colored) {
                                if (c === 2 || c === 5) extra += " border-r-[3px] border-r-black dark:border-r-white";
                                if (r === 2 || r === 5) extra += " border-b-[3px] border-b-black dark:border-b-white";
                              }
                              return (
                                <div key={c} className={`flex h-8 w-8 items-center justify-center border border-border ${bg}${extra} font-mono text-sm font-bold`}>
                                  {cell}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        {!colored && (
                          <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 9 9">
                            <line x1="3" y1="0" x2="3" y2="9" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                            <line x1="6" y1="0" x2="6" y2="9" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                            <line x1="0" y1="3" x2="9" y2="3" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                            <line x1="0" y1="6" x2="9" y2="6" stroke="currentColor" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
                          </svg>
                        )}
                        {colored && sudokuVarWindoku && (
                          <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 9 9">
                            {[[1,1],[1,5],[5,1],[5,5]].map(([rr, cc], i2) => (
                              <rect key={i2} x={cc} y={rr} width={3} height={3} fill="none" stroke="currentColor" strokeDasharray="0.3 0.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
                            ))}
                          </svg>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <Paginator page={page} setPage={setPage} total={results.length} perPage={perPage} />
            </section>
          );
          return (
            <>
              {sudokuResults && renderSudokuResults(sudokuResults, pageSudoku, setPageSudoku, false)}
              {sudokuVarResults && renderSudokuResults(sudokuVarResults, pageSudokuVar, setPageSudokuVar, true)}
            </>
          );
        })()}






      </div>

    </div>
  );
}
