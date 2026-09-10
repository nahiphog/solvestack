import { createFileRoute, Link } from "@tanstack/react-router";
import { OG_IMAGE_URL } from "@/lib/seo";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Fragment, useState } from "react";
import { dodekuSolve, fibbleSolve, fifteenPuzzleSolvable, fifteenPuzzleSolve, findAllShortestPaths, flippingLettersSolve, formatPivotsWord, getRandomWords, getSplitleOtherHalves, getSplitleStrategicWords, getWordFrequency, isValid5LetterWord, isValidJeffGoldblumWord, isValidNLetterWord, isValidShuntleWord, isValidSplitleHalf, isValidWord, isValidWrdlKey, jeffGoldblumLeSolve, marblessSolve, mastermindSolve, MODE_WORD_LENGTH, pivotsBracketRange, sheetdokuSolve, shuntleSolve, sortWordsByFrequency, spellingBeeSolve, splitleP2Solve, splitleSolve, starBattleSolve, sudokuSolve, rotatoSolve, sumpleteSolve, tangoSolve, threepeatSolve, wordiplySearch, wordleSolve, wordPeaksSolve, worwordleSolve, worwordleSplit, wrdlSolve, blunderwallAnalyze, blunderwallNextGuess, type BlunderwallAnalysis, type DodekuCell, type FifteenPuzzleResult, type MarblessSolution, type Mode, type RotatoResult, type SheetdokuFunc, type SheetdokuRegionDef, type StarBattleSolution, type SumpleteSolution, type ThreepeatSolution, type WordleColor, type WordPeaksDirection } from "@/lib/wordLadder";
import wordleStartingWords from "@/data/wordleStartingWords.json";
import flippableCommonWords from "@/data/flippableCommonWords.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { SudokuCopyBoard, copyBoardsAsImage } from "@/components/sudoku-copy-controls";
import { copyTangoSolutionsAsImage } from "@/lib/tango-image";

const bwAnalysisCache = new Map<string, BlunderwallAnalysis>();
function getBwAnalysis(words: string[]): BlunderwallAnalysis {
  const key = words.join(",");
  const hit = bwAnalysisCache.get(key);
  if (hit) return hit;
  const res = blunderwallAnalyze(words);
  bwAnalysisCache.set(key, res);
  return res;
}

const bwNextCache = new Map<string, { guess: string; avg: number; guaranteed: boolean } | null>();
function getBwNext(words: string[], pool: string[], attemptsLeft: number) {
  const key = `${attemptsLeft}|${words.join(",")}|${pool.join(",")}`;
  if (bwNextCache.has(key)) return bwNextCache.get(key)!;
  const res = blunderwallNextGuess(words, pool, attemptsLeft);
  bwNextCache.set(key, res);
  return res;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solver Sanctuary - A collection of puzzle solvers" },
      {
        name: "description",
        content:
          "Free solvers for Wordle, word ladders, Sudoku, Star Battle,  and much more!",
      },
      { property: "og:title", content: "Solver Sanctuary - A collection of puzzle solvers" },
      {
        property: "og:description",
        content:
          "Free solvers for Wordle, word ladders, Sudoku, Star Battle,  and much more!",
      },
      { property: "og:url", content: "https://solversanctuary.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solver Sanctuary - A collection of puzzle solvers" },
      { name: "twitter:description", content: "Free solvers for Wordle, word ladders, Sudoku, Star Battle,  and much more!" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://solversanctuary.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Solver Sanctuary",
          url: "https://solversanctuary.com/",
          description:
            "Free solvers for word games and logic puzzles, including Wordle, word ladders, Sudoku, Star Battle and the 15 puzzle.",
        }),
      },
    ],
  }),

  component: Index,
});

const SECTIONS: { id: "ladder" | "search" | "mathlogic" | "other"; label: string }[] = [
  { id: "search", label: "Wordle" },
  { id: "ladder", label: "Word ladder" },
  { id: "mathlogic", label: "Math and logic" },
  { id: "other", label: "Other word puzzles" },
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
  starbattle: { start: "", goal: "" },
  shuntle: { start: "", goal: "" },
  splitle: { start: "", goal: "" },
  blunderwall: { start: "", goal: "" },
  doubledabble: { start: "", goal: "" },
  wrdl: { start: "", goal: "" },
  reconstruction: { start: "", goal: "" },
  threepeat: { start: "", goal: "" },
  fifteenpuzzle: { start: "", goal: "" },
  sumplete: { start: "", goal: "" },
  rotato: { start: "", goal: "" },
  tango: { start: "", goal: "" },
  

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
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(0)} aria-label="First page">{"<<"}</Button>
      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))} aria-label="Previous page">{"<"}</Button>
      <span>Page {page + 1} of {pages}</span>
      <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(Math.min(pages - 1, page + 1))} aria-label="Next page">{">"}</Button>
      <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(pages - 1)} aria-label="Last page">{">>"}</Button>
    </div>
  );
}

function SortToggle({ value, onChange }: { value: "frequency" | "alphabetical"; onChange: (v: "frequency" | "alphabetical") => void }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium">
      <span className="text-muted-foreground">Sort by</span>
      <div className="inline-flex rounded-md border p-1">
        <button
          type="button"
          onClick={() => onChange("frequency")}
          className={`rounded px-2 py-1 transition ${value === "frequency" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
          aria-pressed={value === "frequency"}
        >
          Commonness
        </button>
        <button
          type="button"
          onClick={() => onChange("alphabetical")}
          className={`rounded px-2 py-1 transition ${value === "alphabetical" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
          aria-pressed={value === "alphabetical"}
        >
          Alphabetical
        </button>
      </div>
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

const MODE_URL_MAP: Record<string, string> = {
  wordle: "/wordle/original",
  doubledabble: "/wordle/Double_Dabble",
  fibble: "/wordle/Lies",
  flippingletters: "/wordle/Flipping_Letters",
  jeffgoldblum: "/wordle/Jeff_Goldblumle",
  shuntle: "/wordle/Shuntle",
  splitle: "/wordle/Splitle",
  worwordle: "/wordle/Wor_Wordle",
  wrdl: "/wordle/Wrdl",
  reconstruction: "/wordle/Reconstruction",
  marbless: "/other_word_puzzles/Marbless",
  mastermind: "/other_word_puzzles/Mastermind",
  spellingbee: "/other_word_puzzles/Spelling_Bee",
  threepeat: "/other_word_puzzles/Threepeat",
  wordpeaks: "/other_word_puzzles/Word_Peaks",
  wordiply: "/other_word_puzzles/Wordiply",
  splice: "/word_ladder/Splice",
  pivots: "/word_ladder/Pivots",
  weaverx: "/word_ladder/Weaver_X",
  craftwords: "/word_ladder/Craftwords",
  "4": "/word_ladder/Original",
  "5": "/word_ladder/Original",
  "6": "/word_ladder/Original",
  blunderwall: "/math/Blunderwall",
  dodeku: "/math/Dodeku",
  sheetdoku: "/math/Sheetdoku",
  sudoku: "/logic/sudoku",
  sudokuvariation: "/logic/sudoku_variation",
  starbattle: "/logic/star_battle",
  fifteenpuzzle: "/math/15_puzzle",
  sumplete: "/math/Sumplete",
  rotato: "/math/Rotato",
  tango: "/logic/tango",
};
const URL_MODE_MAP: Record<string, Mode> = {
  ...Object.fromEntries(
    Object.entries(MODE_URL_MAP).map(([k, v]) => [v, isNaN(Number(k)) ? (k as Mode) : (Number(k) as Mode)])
  ),
  "/word_ladder/Original": 4,
};

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
  const [sortMode, setSortMode] = useState<"frequency" | "alphabetical">("frequency");
  const [_freqLoaded, _setFreqLoaded] = useState(0);
  useEffect(() => {
    let cancelled = false;
    import("@/lib/wordLadder").then(({ ensureFrequenciesLoaded }) =>
      ensureFrequenciesLoaded().then(() => { if (!cancelled) _setFreqLoaded((n) => n + 1); }),
    );
    return () => { cancelled = true; };
  }, []);

  const wordleSortedResults = useMemo(() => {
    if (!wordleResults) return null;
    if (mode !== "wordle" && mode !== "fibble" && mode !== "jeffgoldblum" && mode !== "shuntle") return wordleResults;
    if (mode === "shuntle") {
      if (sortMode === "frequency") {
        return [...wordleResults].sort((a, b) => {
          const fa = getWordFrequency(a.replace(/ /g, ""));
          const fb = getWordFrequency(b.replace(/ /g, ""));
          return fb - fa || a.localeCompare(b);
        });
      }
      return [...wordleResults].sort((a, b) =>
        a.replace(/ /g, "").localeCompare(b.replace(/ /g, ""))
      );
    }
    if (sortMode !== "frequency") return [...wordleResults].sort();
    return sortWordsByFrequency(wordleResults);
  }, [wordleResults, sortMode, mode, _freqLoaded]);
  // per-solver frequency sorting hooks appear after their state declarations below
  const [wordleAcceptAllValid, setWordleAcceptAllValid] = useState(false);
  const [wordleStartingCount, setWordleStartingCount] = useState<number>(3);
  const [reconRows, setReconRows] = useState<number>(4);
  const [reconWord, setReconWord] = useState<string>("");
  const [reconPatterns, setReconPatterns] = useState<WordleColor[][]>(() =>
    Array.from({ length: 3 }, () => Array(5).fill("GREY") as WordleColor[])
  );
  const [reconResults, setReconResults] = useState<string[][] | null>(null);
  const [reconError, setReconError] = useState<string | null>(null);
  const [reconSolving, setReconSolving] = useState(false);
  const [pageRecon, setPageRecon] = useState(0);
  const [selectedRecon, setSelectedRecon] = useState<Set<number>>(new Set());
  const [reconView, setReconView] = useState<"line" | "grid">("line");
  useEffect(() => { setSelectedRecon(new Set()); }, [reconResults]);
  const setReconRowCount = (n: number) => {
    setReconRows(n);
    setReconWord("");
    setReconPatterns(Array.from({ length: n - 1 }, () => Array(5).fill("GREY") as WordleColor[]));
    setReconResults(null);
    setReconError(null);
  };
  const cycleReconTile = (ri: number, ti: number) => {
    setReconResults(null);
    setReconError(null);
    setReconPatterns((prev) =>
      prev.map((row, i) =>
        i === ri
          ? row.map((c, j) => (j === ti ? (c === "GREY" ? "YELLOW" : c === "YELLOW" ? "GREEN" : "GREY") : c))
          : row
      )
    );
  };
  const resetReconGrid = () => {
    setReconWord("");
    setReconPatterns(Array.from({ length: reconRows - 1 }, () => Array(5).fill("GREY") as WordleColor[]));
    setReconResults(null);
    setReconError(null);
  };
  const solveReconstruction = async () => {
    const target = reconWord.replace(/[^A-Za-z]/g, "").toUpperCase();
    setReconResults(null);
    setReconError(null);
    if (target.length !== 5) {
      setReconError("Enter a 5-letter word in the last (green) row.");
      return;
    }
    setReconSolving(true);
    try {
      const { reconstructionSolve, isValid5LetterWord, ensureFrequenciesLoaded } = await import("@/lib/wordLadder");
      if (!(await isValid5LetterWord(target))) {
        setReconError(`"${target}" is not a valid 5-letter word.`);
        return;
      }
      await ensureFrequenciesLoaded();
      const sols = await reconstructionSolve(target, reconPatterns);
      setPageRecon(0);
      setSortMode("frequency");
      setReconResults(sols);
    } catch {
      setReconError("Something went wrong while solving.");
    } finally {
      setReconSolving(false);
    }
  };
  const [wrdlResults, setWrdlResults] = useState<[string, string[]][] | null>(null);
  const [pageWrdl, setPageWrdl] = useState(0);
  const [wrdlWordMap, setWrdlWordMap] = useState<Record<string, string[]> | null>(null);
  const [threepeatWords, setThreepeatWords] = useState<[string, string, string]>(["  IST", "  VER", "  TCH"]);
  const [threepeatResults, setThreepeatResults] = useState<ThreepeatSolution[] | null>(null);
  const [threepeatError, setThreepeatError] = useState<string | null>(null);
  const [threepeatSolving, setThreepeatSolving] = useState(false);
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
  const [mastermindAddCount, setMastermindAddCount] = useState<number>(2);
  const [mastermindRows, setMastermindRows] = useState<{ word: string; greens: number; yellows: number }[]>([
    { word: "", greens: 0, yellows: 0 },
  ]);
  const [mastermindResults, setMastermindResults] = useState<string[] | null>(null);
  const [wordPeaksGuesses, setWordPeaksGuesses] = useState<{ word: string; pattern: WordPeaksDirection[] }[]>([
    { word: "ONION", pattern: ["NONE", "NONE", "NONE", "NONE", "NONE"] },
  ]);
  const [wordPeaksResults, setWordPeaksResults] = useState<string[] | null>(null);

  const [flLetters, setFlLetters] = useState<string[]>(["C","I","K","T","S","L","N","A","H","V"]);
  const [flRevealed, setFlRevealed] = useState<boolean[]>([false, false, false, false, false, false, true, true, false, false]);
  const [flGuesses, setFlGuesses] = useState<{ word: string; pattern: WordleColor[] }[]>([
    { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] },
  ]);
  const [flResults, setFlResults] = useState<{ flippable: string[]; answers: string[] } | null>(null);
  const [pageFl, setPageFl] = useState(0);
  const sortedMastermind = useMemo(() => mastermindResults ? (sortMode === "frequency" ? sortWordsByFrequency(mastermindResults) : [...mastermindResults].sort()) : null, [mastermindResults, sortMode, _freqLoaded]);
  const sortedWordPeaks = useMemo(() => wordPeaksResults ? (sortMode === "frequency" ? sortWordsByFrequency(wordPeaksResults) : [...wordPeaksResults].sort()) : null, [wordPeaksResults, sortMode, _freqLoaded]);
  const sortedFlAnswers = useMemo(() => flResults ? (sortMode === "frequency" ? sortWordsByFrequency(flResults.answers) : [...flResults.answers].sort()) : null, [flResults, sortMode, _freqLoaded]);
  const sortedSpellingBee = useMemo(() => {
    if (!spellingBeeResults) return null;
    return spellingBeeResults.map(([s, ws]) => [s, sortMode === "frequency" ? sortWordsByFrequency(ws) : [...ws].sort()] as [number, string[]]);
  }, [spellingBeeResults, sortMode, _freqLoaded]);
  const [flStartingWords, setFlStartingWords] = useState<0 | 1>(0);
  const [flLocked, setFlLocked] = useState<boolean>(false);
  // Double Dabble: 15 cells (3x5); positions 10 and 14 are faded/disabled. Each usable cell holds 2 distinct letters.
  const [ddKeys, setDdKeys] = useState<string[]>([
    "af", "bl", "cr", "do", "eg", "hx", "iw", "jv", "ks", "mp", "", "ny", "qu", "tz", "",
  ]);
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
  const sortedWor = useMemo(() => {
    if (!worResults) return null;
    if (sortMode !== "frequency") return [...worResults].sort();
    return [...worResults].sort((a, b) => {
      const [a1, a2] = worwordleSplit(a);
      const [b1, b2] = worwordleSplit(b);
      const fa = Math.min(getWordFrequency(a1), getWordFrequency(a2));
      const fb = Math.min(getWordFrequency(b1), getWordFrequency(b2));
      return fb - fa || a.localeCompare(b);
    });
  }, [worResults, sortMode, _freqLoaded]);

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
  const [sudokuSelected, setSudokuSelected] = useState<number[]>([]);
  const [sudokuVarSelected, setSudokuVarSelected] = useState<number[]>([]);
  const [sudokuImgStatus, setSudokuImgStatus] = useState("");
  const [sudokuVarKing, setSudokuVarKing] = useState(false);
  const [sudokuVarKnight, setSudokuVarKnight] = useState(false);
  const [sudokuVarDiagonal, setSudokuVarDiagonal] = useState(false);
  const [sudokuVarNonConsec, setSudokuVarNonConsec] = useState(false);
  const [sudokuVarWindoku, setSudokuVarWindoku] = useState(false);
  const [sudokuVarIrregular, setSudokuVarIrregular] = useState(false);
  const [sudokuVarDisjoint, setSudokuVarDisjoint] = useState(false);
  const [sudokuVarRegions, setSudokuVarRegions] = useState<number[][]>(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [sudokuVarPaintColor, setSudokuVarPaintColor] = useState<number>(1);
  const STAR_BATTLE_DEFAULT_9: number[][] = [
    [1,2,2,3,3,4,4,5,5],
    [1,1,2,2,3,3,4,4,5],
    [6,1,1,2,2,3,3,4,4],
    [6,6,1,1,2,2,3,3,4],
    [8,6,6,1,1,7,7,3,3],
    [8,8,6,6,1,1,7,7,3],
    [9,8,8,6,6,1,1,7,7],
    [9,9,9,9,6,6,1,1,7],
    [9,9,9,9,9,9,6,1,1],
  ];
  const [sbSize, setSbSize] = useState<number>(9);
  const [sbStars, setSbStars] = useState<number>(1);
  const [sbRegions, setSbRegions] = useState<number[][]>(() => STAR_BATTLE_DEFAULT_9.map((r) => r.slice()));
  const [sbPaintColor, setSbPaintColor] = useState<number>(1);
  const [sbResults, setSbResults] = useState<StarBattleSolution[] | null>(null);
  const [pageSb, setPageSb] = useState(0);
  const FP_DEFAULT_3: number[] = [6, 4, 7, 8, 5, 0, 3, 2, 1];
  const FP_DEFAULT_4: number[] = [7, 0, 13, 5, 4, 14, 8, 2, 3, 6, 9, 12, 1, 15, 11, 10];
  const FP_DEFAULT_5: number[] = [
    14, 9, 19, 22, 3,
    1, 10, 21, 8, 15,
    24, 4, 7, 12, 18,
    13, 5, 2, 17, 0,
    16, 11, 6, 23, 20,
  ];
  const FP_DEFAULT_6: number[] = [
    11, 15, 29, 25, 24, 22,
    16, 2, 26, 19, 28, 10,
    9, 30, 33, 0, 13, 7,
    21, 1, 17, 5, 12, 20,
    3, 4, 14, 35, 18, 32,
    23, 31, 8, 34, 27, 6,
  ];
  const FP_DEFAULT_7: number[] = [
    4, 22, 0, 15, 12, 24, 48,
    36, 13, 16, 29, 1, 2, 39,
    43, 7, 42, 26, 45, 38, 20,
    23, 41, 21, 28, 32, 19, 8,
    44, 31, 5, 25, 27, 47, 11,
    30, 46, 3, 40, 34, 37, 33,
    17, 18, 10, 6, 35, 9, 14,
  ];
  const makeFpDefault = (n: number): number[] => {
    if (n === 3) return FP_DEFAULT_3.slice();
    if (n === 4) return FP_DEFAULT_4.slice();
    if (n === 5) return FP_DEFAULT_5.slice();
    if (n === 6) return FP_DEFAULT_6.slice();
    if (n === 7) return FP_DEFAULT_7.slice();
    const arr: number[] = [];
    for (let i = 1; i < n * n; i++) arr.push(i);
    arr.push(0);
    return arr;
  };
  const [fpSize, setFpSize] = useState<number>(4);
  const [fpBoard, setFpBoard] = useState<number[]>(() => FP_DEFAULT_4.slice());
  const [fpResult, setFpResult] = useState<FifteenPuzzleResult | null>(null);
  const [fpStep, setFpStep] = useState(0);
  const [fpMovePage, setFpMovePage] = useState(0);
  const [fpCopied, setFpCopied] = useState(false);
  useEffect(() => {
    if (fpStep > 0) setFpMovePage(Math.floor((fpStep - 1) / 50));
  }, [fpStep]);
  const [fpError, setFpError] = useState<string | null>(null);
  const RT_DEFAULTS: Record<number, number[]> = {
    3: [1, 4, 6, 5, 3, 2, 9, 7, 8],
    4: [15, 5, 6, 13, 8, 7, 2, 9, 12, 14, 3, 10, 1, 4, 11, 16],
    5: [2, 20, 18, 3, 9, 12, 1, 4, 21, 16, 14, 23, 10, 19, 6, 22, 13, 17, 11, 8, 15, 5, 24, 7, 25],
    6: [2, 9, 1, 5, 20, 16, 8, 7, 30, 29, 10, 12, 31, 23, 28, 11, 18, 6, 3, 26, 27, 17, 36, 35, 32, 34, 19, 13, 22, 4, 33, 21, 25, 14, 15, 24],
  };
  const [rtSize, setRtSize] = useState<number>(4);
  const [rtBoard, setRtBoard] = useState<number[]>(() => RT_DEFAULTS[4].slice());
  const [rtResult, setRtResult] = useState<RotatoResult | null>(null);
  const [rtStep, setRtStep] = useState(0);
  const [rtError, setRtError] = useState<string | null>(null);
  const SP_DEFAULT_GRID: number[][] = [
    [9, 2, 4, 1, 7],
    [8, 4, 6, 8, 9],
    [7, 3, 6, 3, 8],
    [2, 5, 8, 1, 7],
    [3, 4, 3, 8, 7],
  ];
  const [spSize, setSpSize] = useState<number>(5);
  const [spGrid, setSpGrid] = useState<string[][]>(() => SP_DEFAULT_GRID.map((r) => r.map(String)));
  const [spRowSums, setSpRowSums] = useState<string[]>(["17", "23", "15", "17", "14"]);
  const [spColSums, setSpColSums] = useState<string[]>(["21", "0", "17", "17", "31"]);
  const [spSolutions, setSpSolutions] = useState<SumpleteSolution[] | null>(null);
  const [spError, setSpError] = useState<string | null>(null);
  const [pageSp, setPageSp] = useState(0);
  const TG_DEFAULT_GRID: number[][] = (() => {
    const g = Array.from({ length: 6 }, () => Array(6).fill(0));
    g[0][5] = 1;
    g[3][2] = 1;
    g[3][5] = 1;
    g[4][4] = 2;
    return g;
  })();
  const TG_DEFAULT_H: number[][] = (() => {
    const h = Array.from({ length: 6 }, () => Array(5).fill(0));
    h[0][2] = 1;
    h[1][1] = 1;
    h[3][3] = 2;
    h[5][1] = 1;
    return h;
  })();
  const TG_DEFAULT_V: number[][] = Array.from({ length: 5 }, () => Array(6).fill(0));
  const [tgGrid, setTgGrid] = useState<number[][]>(() => TG_DEFAULT_GRID.map((r) => r.slice()));
  const [tgH, setTgH] = useState<number[][]>(() => TG_DEFAULT_H.map((r) => r.slice()));
  const [tgV, setTgV] = useState<number[][]>(() => TG_DEFAULT_V.map((r) => r.slice()));
  const [tgSolutions, setTgSolutions] = useState<number[][][] | null>(null);
  const [tgCopyStatus, setTgCopyStatus] = useState("");

  const [tgError, setTgError] = useState<string | null>(null);
  const [pageTg, setPageTg] = useState(0);
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = URL_MODE_MAP[window.location.pathname];
    if (m !== undefined) setMode(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedPaths, setSelectedPaths] = useState<Set<number>>(new Set());
  useEffect(() => { setPagePaths(0); setSelectedPaths(new Set()); }, [paths]);
  useEffect(() => { setPageWordle(0); }, [wordleResults, sortMode, _freqLoaded]);
  useEffect(() => { if (wordleResults) setSortMode("frequency"); }, [wordleResults]);
  useEffect(() => { setPageWrdl(0); }, [wrdlResults]);
  useEffect(() => { setPageMM(0); }, [mastermindResults, sortMode, _freqLoaded]);
  useEffect(() => { if (mastermindResults) setSortMode("frequency"); }, [mastermindResults]);
  useEffect(() => { setPageWP(0); }, [wordPeaksResults, sortMode, _freqLoaded]);
  useEffect(() => { if (wordPeaksResults) setSortMode("frequency"); }, [wordPeaksResults]);

  useEffect(() => { setPageMarbless(0); setSelectedMarbless(new Set()); }, [marblessResults]);
  useEffect(() => { setPageWordiply(0); }, [wordiplyResults, sortMode, _freqLoaded]);
  useEffect(() => { if (wordiplyResults) setSortMode("frequency"); }, [wordiplyResults]);
  useEffect(() => { setPageBee(0); }, [spellingBeeResults]);
  useEffect(() => { setPageFl(0); }, [flResults, sortMode, _freqLoaded]);
  useEffect(() => { if (flResults) setSortMode("frequency"); }, [flResults]);
  useEffect(() => { setPageWor(0); }, [worResults]);
  useEffect(() => { setPageSd(0); }, [sdResults]);
  useEffect(() => { setPageSudoku(0); setSudokuSelected([]); }, [sudokuResults]);
  useEffect(() => { setPageSudokuVar(0); setSudokuVarSelected([]); }, [sudokuVarResults]);
  useEffect(() => { setPageSb(0); }, [sbResults]);

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
    const path = MODE_URL_MAP[String(m)];
    if (path && typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.replaceState({}, "", path);
    }
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
    setSbResults(null);
    setFpResult(null);
    setFpError(null);
    setFpStep(0);
    clearRtOutput();
    setBwResult(null);
    setError(null);
    setSplitleP1Error(null);
    setDdError(null);
    setThreepeatResults(null);
    setThreepeatError(null);
    setTgSolutions(null);
    setTgError(null);
    setPageTg(0);

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

  const solveStarBattle = () => {
    setError(null);
    setSbResults(null);
    for (let r = 0; r < sbSize; r++) {
      for (let c = 0; c < sbSize; c++) {
        if (!sbRegions[r]?.[c]) {
          setError("All cells must be painted with a region color.");
          return;
        }
      }
    }
    const counts = new Map<number, number>();
    for (let r = 0; r < sbSize; r++) for (let c = 0; c < sbSize; c++) {
      const v = sbRegions[r][c];
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    if (counts.size !== sbSize) {
      setError(`Grid must be partitioned into exactly ${sbSize} regions.`);
      return;
    }
    setSolving(true);
    setTimeout(() => {
      const res = starBattleSolve(sbRegions, sbStars, 200);
      if (res.length === 0) setError("No solutions found.");
      else setSbResults(res);
      setSolving(false);
    }, 0);
  };

  const solveFifteenPuzzle = () => {
    setFpError(null);
    setFpResult(null);
    setFpStep(0);
    const N = fpSize;
    const total = N * N;
    const maxTile = total - 1;
    if (fpBoard.length !== total) {
      setFpError(`Board must have exactly ${total} cells.`);
      return;
    }
    const seen = new Set(fpBoard);
    if (seen.size !== total || fpBoard.some((v) => v < 0 || v > maxTile)) {
      setFpError(`Board must contain each of 0-${maxTile} exactly once (blank = 0).`);
      return;
    }
    if (!fifteenPuzzleSolvable(fpBoard, N)) {
      setFpError("This board is not solvable.");
      return;
    }
    setSolving(true);
    setTimeout(() => {
      const res = fifteenPuzzleSolve(fpBoard.slice(), N);
      if (!res) setFpError("No solution found within search limits.");
      else { setFpResult(res); setFpStep(0); }
      setSolving(false);
    }, 0);
  };

  const clearFpBoard = () => {
    setFpBoard(Array(fpSize * fpSize).fill(0));
    setFpResult(null);
    setFpError(null);
    setFpStep(0);
  };

  const changeFpSize = (n: number) => {
    setFpSize(n);
    setFpBoard(makeFpDefault(n));
    setFpResult(null);
    setFpError(null);
    setFpStep(0);
  };

  const clearRtOutput = () => {
    setRtResult(null);
    setRtError(null);
    setRtStep(0);
  };

  const changeRtSize = (n: number) => {
    setRtSize(n);
    setRtBoard(RT_DEFAULTS[n].slice());
    clearRtOutput();
  };

  const clearRtBoard = () => {
    setRtBoard(Array(rtSize * rtSize).fill(0));
    clearRtOutput();
  };

  const solveRotato = () => {
    clearRtOutput();
    const N = rtSize;
    const total = N * N;
    if (rtBoard.some((v) => v < 1 || v > total)) {
      setRtError(`Every cell must contain a number from 1 to ${total}.`);
      return;
    }
    if (new Set(rtBoard).size !== total) {
      setRtError(`The grid must contain each of 1-${total} exactly once.`);
      return;
    }
    setSolving(true);
    setTimeout(() => {
      const res = rotatoSolve(rtBoard.slice(), N);
      if (!res) setRtError("No solution found within search limits.");
      else { setRtResult(res); setRtStep(0); }
      setSolving(false);
    }, 0);
  };

  const clearSpOutput = () => {
    setSpSolutions(null);
    setSpError(null);
    setPageSp(0);
  };

  const changeSpSize = (n: number) => {
    setSpSize(n);
    if (n === 5) {
      setSpGrid(SP_DEFAULT_GRID.map((r) => r.map(String)));
      setSpRowSums(["17", "23", "15", "17", "14"]);
      setSpColSums(["21", "0", "17", "17", "31"]);
    } else {
      setSpGrid(Array.from({ length: n }, () => Array(n).fill("")));
      setSpRowSums(Array(n).fill(""));
      setSpColSums(Array(n).fill(""));
    }
    clearSpOutput();
  };

  const clearSpAll = () => {
    setSpGrid(Array.from({ length: spSize }, () => Array(spSize).fill("")));
    setSpRowSums(Array(spSize).fill(""));
    setSpColSums(Array(spSize).fill(""));
    clearSpOutput();
  };

  const solveSumplete = () => {
    setSpError(null);
    setSpSolutions(null);
    setPageSp(0);
    const parse = (v: string) => {
      const t = v.trim();
      if (t === "" || t === "-") return null;
      const n = Number(t);
      return Number.isFinite(n) && Number.isInteger(n) ? n : null;
    };
    const grid: number[][] = [];
    for (let r = 0; r < spSize; r++) {
      const row: number[] = [];
      for (let c = 0; c < spSize; c++) {
        const v = parse(spGrid[r][c]);
        if (v === null) {
          setSpError("Every cell must contain an integer.");
          return;
        }
        row.push(v);
      }
      grid.push(row);
    }
    const rowSums: number[] = [];
    const colSums: number[] = [];
    for (let i = 0; i < spSize; i++) {
      const rv = parse(spRowSums[i]);
      const cv = parse(spColSums[i]);
      if (rv === null || cv === null) {
        setSpError("Every row and column target sum must be an integer.");
        return;
      }
      rowSums.push(rv);
      colSums.push(cv);
    }
    if (rowSums.reduce((a, b) => a + b, 0) !== colSums.reduce((a, b) => a + b, 0)) {
      setSpError("The row target sums and column target sums must add up to the same total.");
      return;
    }
    setSolving(true);
    setTimeout(() => {
      const res = sumpleteSolve(grid, rowSums, colSums, 50);
      if (res.length === 0) setSpError("No solutions found.");
      else setSpSolutions(res);
      setSolving(false);
    }, 0);
  };




  const clearTgOutput = () => {
    setTgSolutions(null);
    setTgError(null);
    setPageTg(0);
  };

  const toggleTgCell = (r: number, c: number) => {
    const ng = tgGrid.map((row) => row.slice());
    ng[r][c] = (ng[r][c] + 1) % 3;
    setTgGrid(ng);
    clearTgOutput();
  };

  const toggleTgH = (r: number, c: number) => {
    const nh = tgH.map((row) => row.slice());
    nh[r][c] = (nh[r][c] + 1) % 3;
    setTgH(nh);
    clearTgOutput();
  };

  const toggleTgV = (r: number, c: number) => {
    const nv = tgV.map((row) => row.slice());
    nv[r][c] = (nv[r][c] + 1) % 3;
    setTgV(nv);
    clearTgOutput();
  };

  const clearTgAll = () => {
    setTgGrid(Array.from({ length: 6 }, () => Array(6).fill(0)));
    setTgH(Array.from({ length: 6 }, () => Array(5).fill(0)));
    setTgV(Array.from({ length: 5 }, () => Array(6).fill(0)));
    clearTgOutput();
  };

  const solveTango = () => {
    setTgError(null);
    setTgSolutions(null);
    setPageTg(0);
    setSolving(true);
    setTimeout(() => {
      const res = tangoSolve(tgGrid, tgH, tgV, 20);
      if (res.length === 0) setTgError("No solutions found for this configuration.");
      else setTgSolutions(res);
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
    const invalid5: string[] = [];
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
      } else {
        if (mode === "wordle" && wordleAcceptAllValid) continue;
        if (!(await isValid5LetterWord(w))) {
          if (mode === "wordle") {
            invalid5.push(w);
          } else {
            errFn(`"${w}" is not a valid 5-letter English word.`);
            return;
          }
        }
      }
    }
    if (invalid5.length === 1) {
      errFn(`"${invalid5[0]}" is not a valid 5-letter English word.`);
      return;
    }
    if (invalid5.length >= 2) {
      const quoted = invalid5.map((w) => `"${w}"`);
      const joined =
        quoted.length === 2
          ? `${quoted[0]} and ${quoted[1]}`
          : `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`;
      errFn(`${joined} are not valid 5-letter English words.`);
      return;
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
    setSplitleResults(null);
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
    setSplitleResults(null);
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
    setSplitleResults(null);
  };


  const removeGuessRow = (gi: number) => {
    setWordleGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
  };

  const setThreepeatChar = (rowIdx: number, tileIdx: number, raw: string) => {
    const letter = raw.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    const isSpace = raw === " ";
    const isEmpty = raw === "";
    const word = threepeatWords[rowIdx];
    let nextWord = word;
    let changed = false;
    if (letter) {
      if (tileIdx < word.length) {
        nextWord = word.slice(0, tileIdx) + letter + word.slice(tileIdx + 1);
      } else {
        nextWord = word + letter;
      }
      changed = true;
    } else if (isSpace) {
      if (tileIdx < word.length) {
        if (word[tileIdx] !== " ") {
          nextWord = word.slice(0, tileIdx) + " " + word.slice(tileIdx + 1);
          changed = true;
        }
      } else {
        nextWord = word + " ";
        changed = true;
      }
    } else if (isEmpty && tileIdx < word.length && word[tileIdx] !== " ") {
      nextWord = word.slice(0, tileIdx) + " " + word.slice(tileIdx + 1);
      changed = true;
    }
    if (!changed) return;
    setThreepeatWords((prev) => {
      const next = [...prev] as [string, string, string];
      next[rowIdx] = nextWord;
      return next;
    });
    setThreepeatResults(null);
    setThreepeatError(null);
    setTimeout(() => {
      const next = document.getElementById(`threepeat-${rowIdx}-${tileIdx + 1}`) as HTMLInputElement | null;
      if (next) next.focus();
      else {
        const tail = document.getElementById(`threepeat-${rowIdx}-tail`) as HTMLInputElement | null;
        tail?.focus();
      }
    }, 0);
  };

  const handleThreepeatKeyDown = (rowIdx: number, tileIdx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const word = threepeatWords[rowIdx];
    if (e.key === "Backspace") {
      e.preventDefault();
      if (tileIdx === word.length) {
        if (word.length === 0) return;
        const nextWord = word.slice(0, -1);
        setThreepeatWords((prev) => {
          const next = [...prev] as [string, string, string];
          next[rowIdx] = nextWord;
          return next;
        });
        setThreepeatResults(null);
        setThreepeatError(null);
        setTimeout(() => {
          const el = document.getElementById(`threepeat-${rowIdx}-${Math.max(0, word.length - 1)}`) as HTMLInputElement | null;
          if (el) el.focus();
        }, 0);
      } else {
        if (word[tileIdx] && word[tileIdx] !== " ") {
          const nextWord = word.slice(0, tileIdx) + " " + word.slice(tileIdx + 1);
          setThreepeatWords((prev) => {
            const next = [...prev] as [string, string, string];
            next[rowIdx] = nextWord;
            return next;
          });
          setThreepeatResults(null);
          setThreepeatError(null);
        }
        if (tileIdx > 0) {
          setTimeout(() => {
            const el = document.getElementById(`threepeat-${rowIdx}-${tileIdx - 1}`) as HTMLInputElement | null;
            if (el) el.focus();
          }, 0);
        }
      }
    } else if (e.key === " ") {
      e.preventDefault();
      setThreepeatChar(rowIdx, tileIdx, " ");
    }
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
    setFlResults(null);
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
    setFlResults(null);
  };
  const focusFlTile = (gi: number, ti: number) => {
    if (ti < 0 || ti > 4) return;
    const el = document.getElementById(`fl-tile-${gi}-${ti}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };
  const addFlRow = () => {
    setFlGuesses((prev) => [...prev, { word: "", pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] }]);
    setFlResults(null);
  };
  const removeFlRow = (gi: number) => {
    setFlGuesses((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== gi) : prev));
    setFlResults(null);
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

        <div ref={topPillRef} className="mb-3 grid grid-cols-2 gap-2 rounded-md border border-brown/50 bg-brown p-2">
          {SECTIONS.map((s) => {
            const isMath = mode === "dodeku" || mode === "sheetdoku" || mode === "blunderwall" || mode === "fifteenpuzzle" || mode === "sumplete" || mode === "rotato";
            const inSearch = mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl" || mode === "reconstruction";
            const inOther = mode === "spellingbee" || mode === "mastermind" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "threepeat";
            const inLogic = mode === "sudoku" || mode === "sudokuvariation" || mode === "starbattle" || mode === "tango";
            const inMathLogic = isMath || inLogic;
            const inLadder = !inMathLogic && !inSearch && !inOther;
            const isActive = s.id === "mathlogic" ? inMathLogic : s.id === "search" ? inSearch : s.id === "other" ? inOther : inLadder;
            return (
              <button
                key={s.id}
                onClick={() =>
                  s.id === "ladder"
                    ? switchMode(4)
                    : s.id === "search"
                      ? switchMode("wordle")
                      : s.id === "other"
                        ? switchMode("spellingbee")
                        : switchMode("sudoku")
                }
                className={`rounded px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brown-foreground text-brown shadow-sm"
                    : "text-brown-foreground hover:bg-brown-foreground/20"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>


        {(mode === "wordle" || mode === "fibble" || mode === "flippingletters" || mode === "worwordle" || mode === "jeffgoldblum" || mode === "shuntle" || mode === "splitle" || mode === "doubledabble" || mode === "wrdl" || mode === "reconstruction") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
            {([
              { id: "doubledabble", label: "Double Dabble" },
              { id: "flippingletters", label: "Flipping Letters" },
              { id: "jeffgoldblum", label: "Jeff Goldblumle" },
              { id: "fibble", label: "Lies" },
              { id: "wordle", label: "(Original)" },
              { id: "reconstruction", label: "Reconstruction" },
              { id: "shuntle", label: "Shuntle" },
              { id: "splitle", label: "Splitle" },
              { id: "worwordle", label: "Worwordle" },
              { id: "wrdl", label: "Wrdl" },
            ] as { id: Mode; label: string }[]).map((m) => (
              <button
                key={String(m.id)}
                onClick={() => switchMode(m.id)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  mode === m.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}


        {(mode === "spellingbee" || mode === "marbless" || mode === "wordiply" || mode === "wordpeaks" || mode === "mastermind" || mode === "threepeat") && (
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
              onClick={() => switchMode("threepeat")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === "threepeat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Threepeat
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

        {(mode === "dodeku" || mode === "sheetdoku" || mode === "blunderwall" || mode === "sudoku" || mode === "sudokuvariation" || mode === "starbattle" || mode === "fifteenpuzzle" || mode === "sumplete" || mode === "rotato" || mode === "tango") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
            {([
              { id: "fifteenpuzzle", label: "15 Puzzle" },
              { id: "blunderwall", label: "Blunderwall" },
              { id: "dodeku", label: "Dodeku" },
              { id: "rotato", label: "Rotato" },
              { id: "sheetdoku", label: "Sheetdoku" },
              { id: "starbattle", label: "Star Battle" },
              { id: "sudoku", label: "Sudoku (original)" },
              { id: "sudokuvariation", label: "Sudoku (variation)" },
              { id: "sumplete", label: "Sumplete" },
              { id: "tango", label: "Tango" },
            ] as { id: Mode; label: string }[]).map((m) => (
              <button
                key={String(m.id)}
                onClick={() => switchMode(m.id)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  mode === m.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}








        {(mode === 4 || mode === 5 || mode === 6 || mode === "weaverx" || mode === "craftwords" || mode === "splice" || mode === "pivots") && (
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-md border bg-muted p-1">
            <button
              onClick={() => switchMode(4)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                mode === 4 || mode === 5 || mode === 6
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              (Original)
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
              Play Pivots
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

        {(mode === 4 || mode === 5 || mode === 6) && (
          <>
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <a href="https://wordwormdormdork.com/weaver/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Weaver</a>
              <span>·</span>
              <a href="https://flipple.clevergoat.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flipple</a>
              <span>·</span>
              <a href="https://poople.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Poople</a>
              <span>·</span>
              <a href="https://turdle.blog/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Turdle</a>
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
                        <span> · </span>
                        <a href="https://wordle-in-one.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wordle in one</a>
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
              <span> · </span>
              <a href="https://greatest.games/g/wordexo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WordExo</a>
              <span> · </span>
              <a href="https://www.pangramathon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pangramathon</a>
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
            <>
              <a href="https://fibble.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Fibble</a>
              <span> · </span>
              <a href="https://dailylie.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Daily Lie</a>
            </>
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
          {mode === "threepeat" && (
            <a href="https://onelook.com/threepeat" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Threepeat</a>
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

        {mode === "reconstruction" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            <p className="flex flex-wrap gap-3">
              
              <a href="https://crosswordle.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CrossWordle</a>
            </p>
            <p>Fill in the grid with valid 5-letter English words. Like a regular Wordle game, each row's feedback narrows down the list of words available for the following rows.</p>
            <div className="flex items-center gap-2">
              <span>Input rows:</span>
              <select
                value={reconRows}
                onChange={(e) => setReconRowCount(Number(e.target.value))}
                className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {mode === "threepeat" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Type the same letters for all three words.
          </p>
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
            <span className="text-muted-foreground">Optional:</span>
            <button
              type="button"
              onClick={() => applyShuntleStartingWords(2)}
              className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Add 2 strategic starting words
            </button>
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
        {mode === "starbattle" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-1">
            <p>
              <a href="https://www.netflix.com/tudum/puzzled/starstruck/daily" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Netflix</a>
              {" · "}
              <a href="https://www.linkedin.com/games/queens/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Linked In</a>
              {" · "}
              <a href="https://greatest.games/g/shrooms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Greatest Games</a>
              {" · "}
              <a href="https://inkwellgames.com/games/stars/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Inkwell games</a>
              {" · "}
              <a href="https://queensgame.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Community curated list</a>
            </p>
            <p>You are given a square grid, partitioned into non-overlapping regions.</p>
            <p>Each row, column and region contains a fixed number of stars in them.</p>
            <p>Each star cannot be adjacent with each other, not even diagonally adjacent.</p>
          </div>
        )}
        {mode === "fifteenpuzzle" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            <p>
              <a href="https://15puzzle.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">15 puzzle</a>
              {" · "}
              <a href="https://apps.apple.com/my/app/15-fifteen-number-puzzle/id6752566141" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">iOS app</a>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-foreground">Size:</span>
              <select
                value={fpSize}
                onChange={(e) => changeFpSize(parseInt(e.target.value, 10))}
                className="rounded border bg-background px-2 py-1 text-sm"
              >
                <option value={3}>3x3</option>
                <option value={4}>4x4</option>
                <option value={5}>5x5</option>
                <option value={6}>6x6</option>
                <option value={7}>7x7</option>
              </select>
            </div>
            <p>Goal: Slide tiles in numerical order (from left to right, top to bottom).</p>
            <p>Disclaimer: We are using the most rudimentary approach to solve this puzzle. It is by no means an optimal approach.</p>
          </div>
        )}
        {mode === "rotato" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            <p>
              <a href="https://greatest.games/g/rotato/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Rotato</a>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-foreground">Size:</span>
              <select
                value={rtSize}
                onChange={(e) => changeRtSize(parseInt(e.target.value, 10))}
                className="rounded border bg-background px-2 py-1 text-sm"
              >
                {[3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}x{n}</option>
                ))}
              </select>
            </div>
            <p>Place the scrambled grid into chronological order by rotating 2x2 blocks.</p>
            <p>Disclaimer: We are using the most rudimentary approach to solve this puzzle. It is by no means an optimal approach.</p>
          </div>
        )}
        {mode === "sumplete" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            <p>
              <a href="https://sumplete.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sumplete</a>
              {" · "}
              <a href="https://www.cancelwise.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CancelWise</a>
              {" · "}
              <a href="https://apps.apple.com/app/number-sums-math-games/id6449427809" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Number Sums</a>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-foreground">Size:</span>
              <select
                value={spSize}
                onChange={(e) => changeSpSize(parseInt(e.target.value, 10))}
                className="rounded border bg-background px-2 py-1 text-sm"
              >
                {[3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>{n}x{n}</option>
                ))}
              </select>
            </div>
            <p>Cancel all the cells to match the target sums at the end of each row and each column.</p>
          </div>
        )}
        {mode === "tango" && (
          <div className="mb-4 text-sm text-muted-foreground space-y-2">
            <p>
              <a href="https://lnkd.in/tango" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Linked In</a>
            </p>
            <p>Fill in a partially filled 6x6 grid so that every cell holds exactly one circle.</p>
            <ul className="list-disc pl-5">
              <li>Each cell is filled with an orange circle or a blue circle, but not both.</li>
              <li>An "=" between two adjacent cells means those two cells hold identical symbols; an "✕" means they hold distinct symbols.</li>
              <li>No more than two of the same symbol may sit next to each other, horizontally or vertically.</li>
              <li>Each row and column must contain the same number of orange circles and blue circles.</li>
            </ul>
            <p>Click a cell to cycle through empty, orange and blue. Click the edge between two cells to cycle through blank, "=" and "✕".</p>
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
            <span className="text-muted-foreground">Optional:</span>
            <button
              type="button"
              onClick={() => applyWorStartingWords(2)}
              className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Add 2 strategic starting strings
            </button>
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

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setFlLetters(["", "", "", "", "", "", "", "", "", ""]);
                  setFlRevealed([false, false, false, false, false, false, false, false, false, false]);
                  setFlResults(null);
                  setError(null);
                }}
                variant="outline"
                size="lg"
                disabled={flLocked}
              >
                Clear all
              </Button>
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
                        <span className="text-muted-foreground">Optional:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFlStartingWords(1);
                            const pick = StartingFlippableWords[Math.floor(Math.random() * StartingFlippableWords.length)];
                            const row = { word: pick.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] };
                            setFlGuesses((prev) => [...prev.filter((g) => g.word.trim()), row]);
                            setFlResults(null);
                            setError(null);
                          }}
                          className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          Add 1 starting word
                        </button>

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
                    {ddResults && (() => {
                      const ddSorted = ddResults
                        .map(([tuple, words]) => [
                          tuple,
                          [...words].sort((a, b) => getWordFrequency(b) - getWordFrequency(a) || a.localeCompare(b)),
                        ] as [string, string[]])
                        .sort((a, b) => getWordFrequency(b[1][0] ?? "") - getWordFrequency(a[1][0] ?? "") || a[0].localeCompare(b[0]));
                      return (
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
                              {ddSorted.map(([tuple, words]) => {
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
                      );
                    })()}
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
                <span className="text-muted-foreground">Optional:</span>
                <button
                  type="button"
                  onClick={() => applySplitleStartingWords(3)}
                  className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Add 3 strategic starting strings
                </button>
              </div>
            )}
            {mode !== "jeffgoldblum" && mode !== "shuntle" && mode !== "splitle" && mode !== "wrdl" && mode !== "fibble" && (
              mode === "wordle" ? (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="text-sm font-medium">Optional:</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>-</span>
                    <button
                      type="button"
                      onClick={() => {
                        const n = wordleStartingCount;
                        if (n === 0) return;
                        const sheet = (wordleStartingWords as Record<string, string[][]>)[String(n)];
                        if (!sheet || sheet.length === 0) return;
                        const row = sheet[Math.floor(Math.random() * sheet.length)];
                        const newGuesses = row.slice(0, n).map((w) => ({ word: w.toUpperCase(), pattern: ["GREY", "GREY", "GREY", "GREY", "GREY"] as WordleColor[] }));
                        setWordleGuesses((prev) => [...prev.filter((g) => !isEmptyGuessWord(g.word)), ...newGuesses]);
                        setWordleResults(null);
                      }}
                      className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Add
                    </button>
                    <select
                      className="rounded border border-border bg-background px-2 py-1"
                      value={String(wordleStartingCount)}
                      onChange={(e) => setWordleStartingCount(parseInt(e.target.value, 10))}
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <span>strategic starting words.</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <span>-</span>
                    <input
                      type="checkbox"
                      checked={wordleAcceptAllValid}
                      onChange={(e) => setWordleAcceptAllValid(e.target.checked)}
                    />
                    <span>Accept all input as valid.</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span>Additional option: Add</span>
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
              )
            )}
            {mode === "jeffgoldblum" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Optional:</span>
                <button
                  type="button"
                  onClick={() => {
                    setJgStartingWord(1);
                    const word = Math.random() < 0.5 ? "PRAISEWORTHY" : "WISECRACKING";
                    setWordleGuesses((prev) => [...prev.filter((g) => !isEmptyGuessWord(g.word)), { word, pattern: Array(12).fill("GREY") as WordleColor[] }]);
                  }}
                  className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Add 1 strategic starting word
                </button>
              </div>
            )}
            {mode === "wrdl" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Optional:</span>
                <button
                  type="button"
                  onClick={() => applyWrdlStartingWords((wrdlStartingWords === 0 ? 2 : wrdlStartingWords) as 2 | 3)}
                  className="rounded border border-border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Add
                </button>
                <select
                  value={wrdlStartingWords === 0 ? 2 : wrdlStartingWords}
                  onChange={(e) => setWrdlStartingWords(Number(e.target.value) as 2 | 3)}
                  className="rounded border bg-background px-2 py-1 text-sm"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
                <span className="text-muted-foreground">starting strings.</span>
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
                          setSplitleP2Results(null);
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
                              setSplitleP2Results(null);
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
                                  setSplitleP2Results(null);
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
                          setSplitleP2Results(null);
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
            const analysis = bwLocked && canLock ? getBwAnalysis(cleanWords) : null;
            const answeredCount = bwGuesses.filter((g) => g.word && g.tally !== "-").length;
            const advice =
              bwLocked && canLock && bwResult && bwResult.length > 1
                ? getBwNext(cleanWords, bwResult, Math.max(1, 4 - answeredCount))
                : null;
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
                          className={`font-mono uppercase placeholder:normal-case ${w.trim().length === 7 ? "border-green-500 focus-visible:ring-green-500" : ""}`}
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

                {analysis && (
                  <div className="rounded-lg border-2 border-border p-4">
                    <h2 className="mb-2 text-lg font-semibold">Starting word analysis</h2>
                    {(() => {
                      const bestAvg = analysis.starts.find((x) => x.word === analysis.best[0])?.avg;
                      return (
                        <p className="text-sm">
                          Best first {analysis.best.length === 1 ? "guess" : "guesses"}:{" "}
                          {analysis.best.map((w, i) => (
                            <Fragment key={w}>
                              {i > 0 && (i === analysis.best.length - 1 ? " and " : ", ")}
                              <span className="font-mono font-semibold text-green-700 dark:text-green-400">{w}</span>
                            </Fragment>
                          ))}
                          {bestAvg !== undefined && Number.isFinite(bestAvg) && (
                            <> — {bestAvg.toFixed(4)} average guesses needed to win the game.</>
                          )}
                        </p>
                      );
                    })()}
                  </div>
                )}

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
                                  {cleanWords.map((w) => {
                                    const isBest = i === 0 && !!analysis?.best.includes(w);
                                    return (
                                      <option
                                        key={w}
                                        value={w}
                                        style={isBest ? { color: "#16a34a", fontWeight: 700 } : undefined}
                                      >
                                        {w}
                                      </option>
                                    );
                                  })}
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
                        {advice && (
                          <p className="mb-3 text-sm">
                            Next guess to make:{" "}
                            <span className="font-mono font-semibold text-green-700 dark:text-green-400">{advice.guess}</span>{" "}
                            <span className="text-muted-foreground">
                              (expected {advice.avg.toFixed(2)} more {advice.avg === 1 ? "guess" : "guesses"}
                              {advice.guaranteed ? "" : "; cannot be guaranteed within the remaining tries"})
                            </span>
                          </p>
                        )}
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

        ) : mode === "starbattle" ? (
          (() => {
            const N = sbSize;
            const REGION_COLORS: Record<number, { bg: string; border: string; chip: string }> = {
              1:  { bg: "bg-red-500/20",     border: "border-red-500",     chip: "bg-red-500" },
              2:  { bg: "bg-blue-500/20",    border: "border-blue-500",    chip: "bg-blue-500" },
              3:  { bg: "bg-emerald-500/20", border: "border-emerald-500", chip: "bg-emerald-500" },
              4:  { bg: "bg-amber-500/20",   border: "border-amber-500",   chip: "bg-amber-500" },
              5:  { bg: "bg-purple-500/20",  border: "border-purple-500",  chip: "bg-purple-500" },
              6:  { bg: "bg-pink-500/20",    border: "border-pink-500",    chip: "bg-pink-500" },
              7:  { bg: "bg-cyan-500/20",    border: "border-cyan-500",    chip: "bg-cyan-500" },
              8:  { bg: "bg-orange-500/20",  border: "border-orange-500",  chip: "bg-orange-500" },
              9:  { bg: "bg-lime-500/20",    border: "border-lime-500",    chip: "bg-lime-500" },
              10: { bg: "bg-indigo-500/20",  border: "border-indigo-500",  chip: "bg-indigo-500" },
              11: { bg: "bg-rose-500/20",    border: "border-rose-500",    chip: "bg-rose-500" },
              12: { bg: "bg-teal-500/20",    border: "border-teal-500",    chip: "bg-teal-500" },
            };
            const changeSize = (newSize: number) => {
              setSbSize(newSize);
              if (newSize === 9) {
                setSbRegions(STAR_BATTLE_DEFAULT_9.map((r) => r.slice()));
              } else {
                setSbRegions(Array.from({ length: newSize }, () => Array<number>(newSize).fill(0)));
              }
              if (sbPaintColor > newSize) setSbPaintColor(1);
              setSbResults(null);
            };
            return (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <select
                      value={sbStars}
                      onChange={(e) => { setSbStars(parseInt(e.target.value, 10)); setSbResults(null); }}
                      className="rounded border bg-background px-2 py-1"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n === 1 ? "1 star" : `${n} stars`}</option>
                      ))}
                    </select>
                    <span>every row, column and region.</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="font-medium">Size:</span>
                    <select
                      value={sbSize}
                      onChange={(e) => changeSize(parseInt(e.target.value, 10))}
                      className="rounded border bg-background px-2 py-1"
                    >
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>{n}×{n}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">Paint region (click cells to assign)</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: N }, (_, i) => i + 1).map((reg) => {
                      const col = REGION_COLORS[reg] || REGION_COLORS[1];
                      return (
                        <button
                          key={reg}
                          onClick={() => setSbPaintColor(reg)}
                          className={`flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-sm font-medium transition ${
                            sbPaintColor === reg
                              ? `${col.border} ${col.bg}`
                              : "border-border bg-muted hover:bg-accent"
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-sm ${col.chip}`} />
                          Region {reg}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Grid (click to paint region)</div>
                  <div className="inline-block">
                    {Array.from({ length: N }, (_, r) => (
                      <div key={r} className="mt-1 flex gap-1 first:mt-0">
                        {Array.from({ length: N }, (_, c) => {
                          const reg = sbRegions[r]?.[c] ?? 0;
                          const col = REGION_COLORS[reg] || { bg: "bg-muted", border: "border-border", chip: "" };
                          return (
                            <div
                              key={c}
                              onClick={() => {
                                setSbRegions((prev) => prev.map((row, ri) => ri === r ? row.map((x, ci) => ci === c ? sbPaintColor : x) : row));
                                setSbResults(null);
                              }}
                              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded border-2 ${col.border} ${col.bg}`}
                              aria-label={`Cell row ${r + 1} col ${c + 1}, region ${reg}`}
                            >
                              <span className="text-[10px] font-semibold text-muted-foreground">{reg || ""}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      setSbRegions(Array.from({ length: N }, () => Array<number>(N).fill(0)));
                      setSbResults(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Clear all
                  </Button>
                  <Button onClick={solveStarBattle} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
              </div>
            );
          })()

        ) : mode === "fifteenpuzzle" ? (
          (() => {
            const N = fpSize;
            const total = N * N;
            const maxTile = total - 1;
            const setCell = (idx: number, valStr: string) => {
              const s = valStr.replace(/[^0-9]/g, "");
              const nb = fpBoard.slice();
              if (s === "") {
                nb[idx] = 0;
              } else {
                const v = parseInt(s, 10);
                nb[idx] = Number.isFinite(v) ? v : 0;
              }
              setFpBoard(nb);
              setFpResult(null);
              setFpError(null);
              setFpStep(0);
            };
            const displayBoard = fpResult ? fpResult.states[fpStep] : fpBoard;
            const totalSteps = fpResult ? fpResult.states.length : 0;
            // goal position: tile v (1..maxTile) at index v-1; blank at last index
            const isCorrect = (v: number, i: number) => {
              if (v === 0) return i === total - 1;
              return i === v - 1;
            };
            const gridStyle = {
              gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`,
              width: `min(100%, ${N * 56}px)`,
            } as const;
            const cellText = N <= 4 ? "text-lg" : N <= 6 ? "text-base" : "text-sm";
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Enter starting board (leave one tile blank):</div>
                  <div className="grid gap-1" style={gridStyle}>
                    {fpBoard.map((v, i) => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={String(maxTile).length}
                        value={v === 0 ? "" : String(v)}
                        onChange={(e) => setCell(i, e.target.value)}
                        className={`aspect-square w-full min-w-0 rounded border bg-background p-0 text-center font-semibold ${cellText} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={clearFpBoard} size="lg">
                    Clear all
                  </Button>
                  <Button onClick={solveFifteenPuzzle} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
                {fpError && <div className="text-sm text-red-500">{fpError}</div>}
                {fpResult && (
                  <div className="space-y-3 rounded-md border p-4">
                    <div className="text-sm font-medium">
                      {totalSteps === 1
                        ? "Already solved."
                        : `Solved in ${totalSteps - 1} moves.`}
                    </div>
                    <div className="grid gap-1" style={gridStyle}>
                      {displayBoard.map((v, i) => {
                        const justMovedTile = fpStep > 0 ? fpResult.tileMoves[fpStep - 1] : -1;
                        const isMoved = v !== 0 && v === justMovedTile;
                        const correct = v !== 0 && isCorrect(v, i);
                        const borderCls = correct ? "border-2 border-green-500" : "border";
                        const bgCls = v === 0 ? "bg-muted" : isMoved ? "bg-yellow-300 dark:bg-yellow-500 dark:text-black" : "bg-background";
                        return (
                          <div
                            key={i}
                            className={`flex aspect-square w-full min-w-0 items-center justify-center rounded font-semibold ${cellText} ${borderCls} ${bgCls}`}
                          >
                            {v === 0 ? "" : v}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button variant="outline" size="sm" onClick={() => setFpStep((s) => Math.max(0, s - 1))} disabled={fpStep === 0}>Previous move</Button>
                      <div className="text-center text-sm text-muted-foreground">
                        <div>Step {fpStep} of {totalSteps - 1}:</div>
                        <div>
                          {fpStep > 0 ? (
                            <>moved tile: <span className="font-medium">{fpResult.tileMoves[fpStep - 1]}</span></>
                          ) : (
                            "starting position"
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFpStep((s) => Math.min(totalSteps - 1, s + 1))} disabled={fpStep >= totalSteps - 1}>Next move</Button>
                    </div>

                    {fpResult.tileMoves.length > 0 && (() => {
                      const perPage = 50;
                      const pages = Math.max(1, Math.ceil(fpResult.tileMoves.length / perPage));
                      const page = Math.min(fpMovePage, pages - 1);
                      const start = page * perPage;
                      const shown = fpResult.tileMoves.slice(start, start + perPage);
                      return (
                        <div className="text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">Move sequence:</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(`${fpResult.tileMoves.join(" -> ")}\nSolved via ${window.location.href}`);
                                  setFpCopied(true);
                                  setTimeout(() => setFpCopied(false), 1500);
                                } catch { /* ignore */ }
                              }}
                            >
                              {fpCopied ? "Copied" : "Copy sequence"}
                            </Button>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-base leading-relaxed text-foreground">
                            {shown.map((t, j) => {
                              const i = start + j;
                              const isCurrent = i === fpStep - 1;
                              return (
                                <span key={i}>
                                  <span
                                    className={`rounded px-1 font-bold ${
                                      isCurrent
                                        ? "bg-yellow-300 text-black dark:bg-yellow-500"
                                        : "bg-transparent text-foreground"
                                    }`}
                                  >
                                    {t}
                                  </span>
                                  {i < fpResult.tileMoves.length - 1 ? "," : ""}
                                </span>
                              );
                            })}
                          </div>
                          {pages > 1 && (
                            <Paginator page={page} setPage={setFpMovePage} total={fpResult.tileMoves.length} perPage={perPage} />
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setFpStep(0)} disabled={fpStep === 0}>{"<<"}</Button>
                      <Button variant="outline" size="sm" onClick={() => setFpStep(totalSteps - 1)} disabled={fpStep >= totalSteps - 1}>{">>"}</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : mode === "rotato" ? (
          (() => {
            const N = rtSize;
            const total = N * N;
            const cellCls = N >= 6 ? "h-11 w-11 text-base" : "h-14 w-14 text-lg";
            const setCell = (idx: number, valStr: string) => {
              const digits = valStr.replace(/[^0-9]/g, "");
              const nb = rtBoard.slice();
              nb[idx] = digits === "" ? 0 : parseInt(digits, 10);
              setRtBoard(nb);
              clearRtOutput();
            };
            const displayBoard = rtResult ? rtResult.states[rtStep] : rtBoard;
            const totalSteps = rtResult ? rtResult.states.length : 0;
            const activeMove = rtResult && rtStep > 0 ? rtResult.moves[rtStep - 1] : null;
            const inActiveBlock = (i: number) => {
              if (!activeMove) return false;
              const r = Math.floor(i / N);
              const c = i % N;
              return (r === activeMove.br || r === activeMove.br + 1) && (c === activeMove.bc || c === activeMove.bc + 1);
            };
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Enter the scrambled grid (1 to {total}):</div>
                  <div className="overflow-x-auto">
                    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
                      {rtBoard.map((v, i) => (
                        <input
                          key={i}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={String(total).length}
                          value={v === 0 ? "" : String(v)}
                          onChange={(e) => setCell(i, e.target.value)}
                          className={`${cellCls} rounded border bg-background text-center font-semibold [appearance:textfield]`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={clearRtBoard} size="lg">
                    Clear all
                  </Button>
                  <Button onClick={solveRotato} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
                {rtError && <div className="text-sm text-red-500">{rtError}</div>}
                {rtResult && (
                  <div className="space-y-3 rounded-md border p-4">
                    <div className="text-sm font-medium">
                      {totalSteps === 1 ? "Already solved." : `Solved in ${totalSteps - 1} rotations.`}
                    </div>
                    <div className="overflow-x-auto">
                      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
                        {displayBoard.map((v, i) => {
                          const correct = v === i + 1;
                          const active = inActiveBlock(i);
                          const borderCls = active
                            ? activeMove!.clockwise
                              ? "border-2 border-blue-500"
                              : "border-2 border-orange-500"
                            : "border";
                          const bgCls = active
                            ? activeMove!.clockwise
                              ? "bg-blue-100 dark:bg-blue-900/50"
                              : "bg-orange-100 dark:bg-orange-900/50"
                            : "bg-background";
                          const textCls = correct ? "text-green-600 dark:text-green-400" : "";
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-center rounded font-semibold ${cellCls} ${borderCls} ${bgCls} ${textCls}`}
                            >
                              {v}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Step {rtStep} of {totalSteps - 1}
                      {activeMove && (
                        <>
                          {" — rotated the 2x2 block at row "}
                          <span className="font-medium text-foreground">{activeMove.br + 1}</span>
                          {", column "}
                          <span className="font-medium text-foreground">{activeMove.bc + 1}</span>
                          {" "}
                          <span className={`font-semibold ${activeMove.clockwise ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                            {activeMove.clockwise ? "clockwise" : "anticlockwise"}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="text-blue-600 dark:text-blue-400">Blue</span> = clockwise rotation,{" "}
                      <span className="text-orange-600 dark:text-orange-400">orange</span> = anticlockwise rotation, green = number in its final cell.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setRtStep(0)} disabled={rtStep === 0}>{"<<"}</Button>
                      <Button variant="outline" size="sm" onClick={() => setRtStep((s) => Math.max(0, s - 1))} disabled={rtStep === 0}>Previous move</Button>
                      <Button variant="outline" size="sm" onClick={() => setRtStep((s) => Math.min(totalSteps - 1, s + 1))} disabled={rtStep >= totalSteps - 1}>Next move</Button>
                      <Button variant="outline" size="sm" onClick={() => setRtStep(totalSteps - 1)} disabled={rtStep >= totalSteps - 1}>{">>"}</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : mode === "tango" ? (
          (() => {
            const N = 6;
            const templateFor = (cell: number, gap: number) =>
              Array.from({ length: 2 * N - 1 }, (_, i) => (i % 2 === 0 ? `${cell}px` : `${gap}px`)).join(" ");

            const total = tgSolutions ? tgSolutions.length : 0;
            const sol = tgSolutions ? tgSolutions[Math.min(pageTg, total - 1)] : null;
            const circle = (v: number, key: string, interactive: boolean, cell: number, onClick?: () => void) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                disabled={!interactive}
                aria-label={v === 1 ? "orange circle" : v === 2 ? "blue circle" : "empty cell"}
                className="flex items-center justify-center rounded border bg-background disabled:cursor-default"
                style={{ height: cell, width: cell }}
              >
                {v !== 0 && (
                  <span
                    className={`block rounded-full border-2 ${
                      v === 1
                        ? "border-orange-700 bg-orange-500"
                        : "border-blue-800 bg-blue-500"
                    }`}
                    style={{ height: Math.round(cell * 0.7), width: Math.round(cell * 0.7) }}
                  />
                )}
              </button>
            );
            const relLabel = (rel: number) => (rel === 1 ? "=" : rel === 2 ? "✕" : "");
            const board = (
              grid: number[][],
              interactive: boolean,
              cell = 40,
              gap = 16,
            ) => (
              <div className="inline-grid items-center justify-items-center" style={{ gridTemplateColumns: templateFor(cell, gap) }}>

                {Array.from({ length: 2 * N - 1 }).map((_, gr) =>
                  Array.from({ length: 2 * N - 1 }).map((__, gc) => {
                    const rowIsCell = gr % 2 === 0;
                    const colIsCell = gc % 2 === 0;
                    if (rowIsCell && colIsCell) {
                      const r = gr / 2;
                      const c = gc / 2;
                      return circle(
                        grid[r][c],
                        `c-${gr}-${gc}`,
                        interactive,
                        cell,
                        interactive ? () => toggleTgCell(r, c) : undefined,
                      );
                    }
                    if (rowIsCell && !colIsCell) {
                      const r = gr / 2;
                      const c = (gc - 1) / 2;
                      return (
                        <button
                          key={`h-${gr}-${gc}`}
                          type="button"
                          disabled={!interactive}
                          onClick={interactive ? () => toggleTgH(r, c) : undefined}
                          className="flex items-center justify-center text-sm font-bold text-foreground disabled:cursor-default"
                          style={{ height: cell, width: gap }}
                          aria-label={`horizontal relation row ${r + 1} column ${c + 1}`}
                        >
                          {relLabel(tgH[r][c])}
                        </button>
                      );
                    }
                    if (!rowIsCell && colIsCell) {
                      const r = (gr - 1) / 2;
                      const c = gc / 2;
                      return (
                        <button
                          key={`v-${gr}-${gc}`}
                          type="button"
                          disabled={!interactive}
                          onClick={interactive ? () => toggleTgV(r, c) : undefined}
                          className="flex items-center justify-center text-sm font-bold text-foreground disabled:cursor-default"
                          style={{ height: gap, width: cell }}
                          aria-label={`vertical relation row ${r + 1} column ${c + 1}`}
                        >
                          {relLabel(tgV[r][c])}
                        </button>
                      );
                    }
                    return <div key={`x-${gr}-${gc}`} style={{ height: gap, width: gap }} />;

                  }),
                )}
              </div>
            );
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Enter the starting board:</div>
                  <div className="overflow-x-auto">{board(tgGrid, true)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={clearTgAll} size="lg">
                    Clear all
                  </Button>
                  <Button onClick={solveTango} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
                {tgError && <div className="text-sm text-red-500">{tgError}</div>}
                {sol && (
                  <div className="space-y-3 rounded-md border p-4">
                    <div className="text-sm font-medium">
                      {total >= 20
                        ? "Found at least 20 solutions."
                        : `Found ${total} solution${total === 1 ? "" : "s"}.`}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">Solution #{Math.min(pageTg, total - 1) + 1}:</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const msg = await copyTangoSolutionsAsImage(tgSolutions ?? [], tgH, tgV);
                          setTgCopyStatus(msg);
                          setTimeout(() => setTgCopyStatus(""), 2000);
                        }}
                      >
                        Copy all
                      </Button>
                      {tgCopyStatus && <span className="text-xs text-muted-foreground">{tgCopyStatus}</span>}
                    </div>
                    <div>{board(sol, false, 28, 12)}</div>

                    {total > 1 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPageTg(0)} disabled={pageTg === 0}>{"<<"}</Button>
                        <Button variant="outline" size="sm" onClick={() => setPageTg((x) => Math.max(0, x - 1))} disabled={pageTg === 0}>{"<"}</Button>
                        <span className="text-sm text-muted-foreground">Page {pageTg + 1} of {total}</span>
                        <Button variant="outline" size="sm" onClick={() => setPageTg((x) => Math.min(total - 1, x + 1))} disabled={pageTg >= total - 1}>{">"}</Button>
                        <Button variant="outline" size="sm" onClick={() => setPageTg(total - 1)} disabled={pageTg >= total - 1}>{">>"}</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : mode === "sumplete" ? (
          (() => {
            const N = spSize;
            const cellCls = N >= 8 ? "h-9 w-9 text-sm" : N >= 6 ? "h-11 w-11 text-base" : "h-12 w-12 text-base";
            const sanitizeInt = (v: string) => {
              const neg = v.trim().startsWith("-");
              const digits = v.replace(/[^0-9]/g, "");
              return (neg ? "-" : "") + digits;
            };
            const setCell = (r: number, c: number, v: string) => {
              const clean = sanitizeInt(v);
              const ng = spGrid.map((row) => row.slice());
              ng[r][c] = clean;
              setSpGrid(ng);
              clearSpOutput();
            };
            const total = spSolutions ? spSolutions.length : 0;
            const sol = spSolutions ? spSolutions[Math.min(pageSp, total - 1)] : null;
            return (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Enter the grid and the target sums:</div>
                  <div className="overflow-x-auto">
                    <div
                      className="inline-grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${N + 1}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: N }).map((_, r) => (
                        <Fragment key={`row-${r}`}>
                          {Array.from({ length: N }).map((__, c) => (
                            <input
                              key={`g-${r}-${c}`}
                              type="text"
                              inputMode="decimal"
                              pattern="-?[0-9]*"
                              value={spGrid[r][c]}
                              onChange={(e) => setCell(r, c, e.target.value)}
                              className={`${cellCls} rounded border bg-background text-center font-semibold`}
                            />
                          ))}
                          <input
                            key={`rs-${r}`}
                            type="text"
                            inputMode="decimal"
                            pattern="-?[0-9]*"
                            value={spRowSums[r]}
                            onChange={(e) => {
                              const nr = spRowSums.slice();
                              nr[r] = sanitizeInt(e.target.value);
                              setSpRowSums(nr);
                              clearSpOutput();
                            }}
                            className={`${cellCls} rounded border-2 border-primary bg-muted text-center font-bold`}
                          />
                        </Fragment>
                      ))}
                      {Array.from({ length: N }).map((_, c) => (
                        <input
                          key={`cs-${c}`}
                          type="text"
                          inputMode="decimal"
                          pattern="-?[0-9]*"
                          value={spColSums[c]}
                          onChange={(e) => {
                            const nc = spColSums.slice();
                            nc[c] = sanitizeInt(e.target.value);
                            setSpColSums(nc);
                            clearSpOutput();
                          }}
                          className={`${cellCls} rounded border-2 border-primary bg-muted text-center font-bold`}
                        />
                      ))}
                      <div className={cellCls} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={clearSpAll} size="lg">
                    Clear all
                  </Button>
                  <Button onClick={solveSumplete} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve"}
                  </Button>
                </div>
                {spError && <div className="text-sm text-red-500">{spError}</div>}
                {sol && (
                  <div className="space-y-3 rounded-md border p-4">
                    <div className="text-sm font-medium">
                      Found {total} solution{total === 1 ? "" : "s"}.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Green circled cells are kept; red crossed-out cells are cancelled.
                    </div>
                    <div className="overflow-x-auto">
                      <div
                        className="inline-grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
                      >
                        {sol.map((row, r) =>
                          row.map((keep, c) => (
                            <div
                              key={`s-${r}-${c}`}
                              className={`relative flex items-center justify-center font-semibold ${cellCls} ${
                                keep
                                  ? "rounded-full border-2 border-green-500 text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {spGrid[r][c]}
                              {!keep && (
                                <span
                                  aria-hidden
                                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-500/80"
                                >
                                  ✕
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {total > 1 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPageSp(0)} disabled={pageSp === 0}>{"<<"}</Button>
                        <Button variant="outline" size="sm" onClick={() => setPageSp((x) => Math.max(0, x - 1))} disabled={pageSp === 0}>{"<"}</Button>
                        <span className="text-sm text-muted-foreground">Page {pageSp + 1} of {total}</span>
                        <Button variant="outline" size="sm" onClick={() => setPageSp((x) => Math.min(total - 1, x + 1))} disabled={pageSp >= total - 1}>{">"}</Button>
                        <Button variant="outline" size="sm" onClick={() => setPageSp(total - 1)} disabled={pageSp >= total - 1}>{">>"}</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : mode === "threepeat" ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">Enter three words (space to leave it blank):</p>
            {[0, 1, 2].map((idx) => {
              const word = threepeatWords[idx];
              const chars = word.split("");
              return (
                <div key={idx} className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground w-6">{idx + 1}.</span>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase().replace(/[^A-Z ]/g, "");
                      setThreepeatWords((prev) => {
                        const next = [...prev] as [string, string, string];
                        next[idx] = v;
                        return next;
                      });
                      setThreepeatResults(null);
                      setThreepeatError(null);
                    }}
                    placeholder="e.g. C T"
                    className="flex-1 min-w-[8rem] rounded border-2 border-border bg-background px-3 py-2 font-mono text-lg uppercase outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex flex-wrap gap-1">
                    {chars.map((ch, i) => {
                      const isBlank = ch === " ";
                      return (
                        <div
                          key={i}
                          className="flex h-10 w-10 items-center justify-center rounded border-2 border-border bg-muted text-center font-mono text-lg font-bold uppercase"
                        >
                          {isBlank ? "" : ch}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setThreepeatWords(["", "", ""]);
                  setThreepeatResults(null);
                  setThreepeatError(null);
                }}
                variant="outline"
                size="lg"
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  setThreepeatError(null);
                  setThreepeatResults(null);
                  const [w1, w2, w3] = threepeatWords;
                  if (!w1.length || !w2.length || !w3.length) {
                    setThreepeatError("Please enter all three words.");
                    return;
                  }
                  setThreepeatSolving(true);
                  try {
                    const res = await threepeatSolve(w1, w2, w3);
                    if (res.length === 0) setThreepeatError("No solutions found.");
                    else setThreepeatResults(res);
                  } catch (e) {
                    setThreepeatError(e instanceof Error ? e.message : String(e));
                  } finally {
                    setThreepeatSolving(false);
                  }
                }}
                disabled={threepeatSolving}
                size="lg"
              >
                {threepeatSolving ? "Solving..." : "Solve"}
              </Button>
            </div>
            {threepeatError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {threepeatError}
              </div>
            )}
            {threepeatResults && threepeatResults.length > 0 && (
              <section className="mt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold">
                    {threepeatResults.length} possible {threepeatResults.length === 1 ? "solution" : "solutions"}
                  </h2>
                  <button
                    onClick={() => {
                      const lines = threepeatResults.map(([f, a, b, c]) => `${f} | ${a}, ${b}, ${c}`).join("\n");
                      copyText(`${threepeatResults.length} possible ${threepeatResults.length === 1 ? "solution" : "solutions"}:\n${lines}\n\nSolved via ${window.location.href}.`);
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                    aria-label="Copy all solutions"
                  >
                    {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                  </button>
                </div>
                <div className="rounded-lg border bg-card divide-y">
                  {threepeatResults.map(([fill, a, b, c]) => (
                    <div key={fill} className="p-3 font-mono text-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded bg-muted px-2 py-1 font-bold tracking-widest">{fill}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="tracking-widest">{a}, {b}, {c}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : mode === "reconstruction" ? (

          <div className="space-y-2">
            {reconPatterns.map((row, ri) => (
              <div key={ri} className="flex gap-1.5">
                {row.map((color, ti) => (
                  <button
                    key={ti}
                    type="button"
                    onClick={() => cycleReconTile(ri, ti)}
                    aria-label={`Row ${ri + 1} tile ${ti + 1}: ${color}`}
                    className={`flex h-12 w-12 items-center justify-center rounded border-2 text-center font-mono text-xl font-bold uppercase transition ${
                      color === "GREEN"
                        ? "bg-green-600 text-white border-green-600"
                        : color === "YELLOW"
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-muted text-foreground border-border"
                    }`}
                  />
                ))}
              </div>
            ))}
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, ti) => (
                <input
                  key={ti}
                  id={`recon-tile-${ti}`}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={reconWord[ti] ?? ""}
                  aria-label={`Answer tile ${ti + 1}`}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                    setReconResults(null);
                    setReconError(null);
                    setReconWord((prev) => {
                      const arr = prev.padEnd(5, " ").split("");
                      arr[ti] = v ? v.slice(-1) : " ";
                      return arr.join("").replace(/ +$/, "");
                    });
                    if (v) document.getElementById(`recon-tile-${ti + 1}`)?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !(reconWord[ti] ?? "").trim() && ti > 0) {
                      e.preventDefault();
                      document.getElementById(`recon-tile-${ti - 1}`)?.focus();
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      document.getElementById(`recon-tile-${ti - 1}`)?.focus();
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      document.getElementById(`recon-tile-${ti + 1}`)?.focus();
                    }
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded border-2 border-green-600 bg-green-600 text-center font-mono text-xl font-bold uppercase text-white caret-white outline-none transition focus:ring-2 focus:ring-ring"
                />
              ))}
            </div>
            <div className="flex flex-nowrap gap-2 pt-1">
              <Button onClick={resetReconGrid} variant="outline" size="sm">Reset grid</Button>
              <Button onClick={solveReconstruction} disabled={reconSolving} size="sm">
                {reconSolving ? "Solving..." : "Solve"}
              </Button>
            </div>
            {reconError && <p className="text-sm text-destructive">{reconError}</p>}
          </div>

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

        {paths && (() => {
          const isClassic = mode === 4 || mode === 5 || mode === 6 || mode === "craftwords" || mode === "weaverx" || mode === "splice";
          const sortedPaths = isClassic && sortMode === "frequency"
            ? [...paths]
                .map((p, i) => ({ p, i, min: Math.min(...p.map((w) => getWordFrequency(w))) }))
                .sort((a, b) => b.min - a.min || a.i - b.i)
                .map((x) => x.p)
            : paths;
          return (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sortedPaths.length} optimal {sortedPaths.length === 1 ? "path" : "paths"} · {sortedPaths[0].length - 1} steps
              </h2>
              <button
                onClick={() => {
                  const hasSelection = selectedPaths.size > 0;
                  const indices = hasSelection
                    ? [...selectedPaths].sort((a, b) => a - b)
                    : sortedPaths.map((_, i) => i);
                  const items = indices.map((i) => {
                    const p = sortedPaths[i];
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
            {isClassic && <SortToggle value={sortMode} onChange={setSortMode} />}

            <ol className="space-y-3">
              {sortedPaths.slice(pagePaths * 50, pagePaths * 50 + 50).map((path, idx) => {
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
            <Paginator page={pagePaths} setPage={setPagePaths} total={sortedPaths.length} />
          </section>
          );
        })()}


        {wordiplyResults && (() => {
          const sortGroup = (ws: string[]) =>
            sortMode === "frequency"
              ? [...ws].sort((a, b) => getWordFrequency(b) - getWordFrequency(a) || a.localeCompare(b))
              : [...ws].sort((a, b) => a.localeCompare(b));
          const reversed = [...wordiplyResults].reverse().map(([extra, ws]) => [extra, sortGroup(ws)] as [number, string[]]);
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
            <SortToggle value={sortMode} onChange={setSortMode} />
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

        {wordleSortedResults && (
          <section className="mt-10">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {wordleSortedResults.length} possible {wordleSortedResults.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${wordleSortedResults.length} possible ${wordleSortedResults.length === 1 ? "answer" : "answers"}:\n${wordleSortedResults.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            {(mode === "wordle" || mode === "fibble" || mode === "jeffgoldblum" || mode === "shuntle") && (
              <SortToggle value={sortMode} onChange={setSortMode} />
            )}
            {mode === "shuntle" ? (
              <div className="space-y-4">
                {[4, 5, 6, 7].map((len) => {
                  const group = wordleSortedResults.filter((w) => w.replace(/ /g, "").length === len);
                  if (group.length === 0) return null;
                  return (
                    <div key={len}>
                      <div className="mb-2 text-sm font-semibold">{len} letters ({group.length})</div>
                      <div className="rounded-lg border bg-card p-4">
                        <div className="flex flex-wrap gap-2 font-mono text-sm">
                          {group.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => addWordleGuessFromAnswer(w)}
                              className="rounded bg-muted px-2 py-1 tracking-widest hover:bg-accent hover:text-accent-foreground"
                            >
                              {w.split("").map((ch, i) => (
                                <span key={i} className={ch === " " ? "text-muted-foreground/60" : ""}>
                                  {ch === " " ? "·" : ch}
                                </span>
                              ))}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex flex-wrap gap-2 font-mono text-sm">
                    {wordleSortedResults.slice(pageWordle * 60, pageWordle * 60 + 60).map((w) => (
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
                <Paginator page={pageWordle} setPage={setPageWordle} total={wordleSortedResults.length} perPage={60} />
              </>
            )}

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
                  const lines = [...wrdlResults].sort((a, b) => b[1].length - a[1].length).map(([k, ws]) => `${k} | ${ws.join(", ")}`).join("\n");
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
          const requiredLetters = new Set(
            (spellingBeeMiddle + spellingBeeOthers).toUpperCase().replace(/[^A-Z]/g, "").split("")
          );
          const isPangram = (w: string) => {
            const s = new Set(w.toUpperCase().split(""));
            if (s.size !== requiredLetters.size) return false;
            for (const ch of requiredLetters) if (!s.has(ch)) return false;
            return true;
          };
          const allWords = spellingBeeResults.flatMap(([, ws]) => ws);
          const pangrams = allWords.filter(isPangram);
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
              {requiredLetters.size === 7 && pangrams.length > 0 && (
                <div className="mb-3 rounded-lg border border-amber-500/60 bg-amber-500/10 p-3 text-sm">
                  <div className="font-semibold text-amber-700 dark:text-amber-300">
                    The {pangrams.length} {pangrams.length === 1 ? "word" : "words"} highlighted in yellow {pangrams.length === 1 ? "uses" : "use"} all 7 letters.
                  </div>
                </div>
              )}

              <div className="mb-3">
                <SortToggle value={sortMode} onChange={setSortMode} />
              </div>
              <div className="space-y-4">
                {(sortedSpellingBee ?? spellingBeeResults).map(([score, words]) => (
                  <div key={score} className="rounded-lg border bg-card p-4">
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      {score} {score === 1 ? "point" : "points"} · {words.length} {words.length === 1 ? "word" : "words"}
                    </div>
                    <div className="font-mono text-sm">
                      {words.map((w, i) => (
                        <span key={w}>
                          {i > 0 && ", "}
                          <span className={isPangram(w) ? "rounded bg-amber-500/20 px-1 font-bold text-amber-800 dark:text-amber-200" : ""}>
                            {w}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {mastermindResults && sortedMastermind && (
          <section className="mt-10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sortedMastermind.length} possible {sortedMastermind.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${sortedMastermind.length} possible ${sortedMastermind.length === 1 ? "answer" : "answers"}:\n${sortedMastermind.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <SortToggle value={sortMode} onChange={setSortMode} />
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {sortedMastermind.slice(pageMM * 60, pageMM * 60 + 60).map((w) => (
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
            <Paginator page={pageMM} setPage={setPageMM} total={sortedMastermind.length} perPage={60} />
          </section>
        )}

        {wordPeaksResults && sortedWordPeaks && (
          <section className="mt-10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sortedWordPeaks.length} possible {sortedWordPeaks.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${sortedWordPeaks.length} possible ${sortedWordPeaks.length === 1 ? "answer" : "answers"}:\n${sortedWordPeaks.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <SortToggle value={sortMode} onChange={setSortMode} />
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {sortedWordPeaks.slice(pageWP * 50, pageWP * 50 + 50).map((w) => (
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
            <Paginator page={pageWP} setPage={setPageWP} total={sortedWordPeaks.length} />
          </section>
        )}

        {flResults && sortedFlAnswers && (
          <section className="mt-10">
            <div className="mb-2 text-sm text-muted-foreground">
              {flResults.flippable.length} flippable 5-letter {flResults.flippable.length === 1 ? "word" : "words"} from your letter bank.
            </div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sortedFlAnswers.length} possible {sortedFlAnswers.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  copyText(`${sortedFlAnswers.length} possible ${sortedFlAnswers.length === 1 ? "answer" : "answers"}:\n${sortedFlAnswers.join(", ")}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <SortToggle value={sortMode} onChange={setSortMode} />
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                {sortedFlAnswers.slice(pageFl * 50, pageFl * 50 + 50).map((w) => (
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
                      setFlResults(null);
                    }}
                    className="rounded bg-muted px-2 py-1 tracking-widest transition hover:bg-accent hover:text-accent-foreground"
                    title={`Add ${w.toUpperCase()} as a guess`}
                  >
                    {w.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <Paginator page={pageFl} setPage={setPageFl} total={sortedFlAnswers.length} />
          </section>
        )}

        {worResults && sortedWor && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {sortedWor.length} possible {sortedWor.length === 1 ? "answer" : "answers"}
              </h2>
              <button
                onClick={() => {
                  const items = sortedWor.map((w) => {
                    const [a, b] = worwordleSplit(w);
                    return `${w} (${a} + ${b})`;
                  }).join(", ");
                  copyText(`${sortedWor.length} possible ${sortedWor.length === 1 ? "answer" : "answers"}:\n${items}\n\nSolved via ${window.location.href}.`);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy all answers"
              >
                {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
              </button>
            </div>
            <SortToggle value={sortMode} onChange={setSortMode} />
            <div className="mt-3 rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-2 font-mono text-sm">
                {sortedWor.slice(pageWor * 50, pageWor * 50 + 50).map((w) => {
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
            <Paginator page={pageWor} setPage={setPageWor} total={sortedWor.length} />
          </section>
        )}






        {reconResults && (() => {
          const sorted = sortMode === "frequency"
            ? [...reconResults]
                .map((s, i) => ({ s, i, min: Math.min(...s.map((w) => getWordFrequency(w))) }))
                .sort((a, b) => b.min - a.min || a.i - b.i)
                .map((x) => x.s)
            : [...reconResults].sort((a, b) => a.join(" ").localeCompare(b.join(" ")));
          return (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-semibold">
                {reconResults.length} {reconResults.length === 1 ? "sequence" : "sequences"}
              </h2>
              {reconResults.length > 0 && <SortToggle value={sortMode} onChange={setSortMode} />}
              <ol className="space-y-3">
                {sorted.slice(pageRecon * 60, pageRecon * 60 + 60).map((sol, idx) => (
                  <li key={pageRecon * 60 + idx} className="rounded-lg border border-border bg-card p-3 text-card-foreground">
                    <div className="mb-1 text-xs text-muted-foreground">#{pageRecon * 60 + idx + 1}</div>
                    <div className="font-mono text-sm font-semibold tracking-widest">
                      {sol.join(" → ")}
                    </div>
                  </li>
                ))}
              </ol>
              <Paginator page={pageRecon} setPage={setPageRecon} total={sorted.length} perPage={60} />
            </section>
          );
        })()}

        {marblessResults && (() => {
          const sortedMarbless = sortMode === "frequency"
            ? [...marblessResults]
                .map((s, i) => ({ s, i, min: Math.min(...s.words.map((w) => getWordFrequency(w))) }))
                .sort((a, b) => b.min - a.min || a.i - b.i)
                .map((x) => x.s)
            : marblessResults;
          return (
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
                    : sortedMarbless.map((_, i) => i);
                  const items = indices
                    .map((i) => {
                      const s = sortedMarbless[i];
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
            <SortToggle value={sortMode} onChange={setSortMode} />
            <ol className="space-y-4">
              {sortedMarbless.slice(pageMarbless * 50, pageMarbless * 50 + 50).map((sol, idx) => {
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
            <Paginator page={pageMarbless} setPage={setPageMarbless} total={sortedMarbless.length} />

          </section>
          );
        })()}

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
            selected: number[],
            setSelected: React.Dispatch<React.SetStateAction<number[]>>,
          ) => (
            <section className="mt-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {results.length}{results.length === 200 ? "+" : ""} {results.length === 1 ? "solution" : "solutions"}
                </h2>
                <div className="flex shrink-0 items-center gap-2">
                  {sudokuImgStatus && <span className="text-xs text-muted-foreground">{sudokuImgStatus}</span>}
                  {selected.length > 0 && (
                    <button
                      onClick={() => setSelected([])}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                      Clear selection
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (selected.length > 0) {
                        const idxs = [...selected].sort((a, b) => a - b);
                        const msg = await copyBoardsAsImage(
                          idxs.map((i) => results[i]),
                          idxs.map((i) => `#${i + 1}`),
                        );
                        setSudokuImgStatus(msg);
                        setTimeout(() => setSudokuImgStatus(""), 2500);
                        return;
                      }
                      const items = results
                        .map((sol, i) => `#${i + 1}\n${sol.map((row) => row.join(" ")).join("\n")}`)
                        .join("\n\n");
                      copyText(`${items}\n\nSolved via ${window.location.href}.`);
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                    aria-label={selected.length > 0 ? "Copy selected solutions as image" : "Copy all solutions"}
                  >
                    {selected.length > 0
                      ? (<><Copy size={14} /> Copy {selected.length} as image</>)
                      : copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                  </button>
                </div>
              </div>
              <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.slice(page * perPage, page * perPage + perPage).map((sol, idx) => {
                  const i = page * perPage + idx;
                  const isSel = selected.includes(i);
                  return (
                    <li
                      key={i}
                      onClick={() => setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}
                      className={`cursor-pointer rounded-lg border bg-card p-3 text-card-foreground transition ${isSel ? "border-emerald-500 ring-2 ring-emerald-500/50" : "hover:border-foreground/30"}`}
                    >
                      <div className="mb-2 text-xs text-muted-foreground">#{i + 1}{isSel ? " — selected" : ""}</div>
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
              {sudokuResults && renderSudokuResults(sudokuResults, pageSudoku, setPageSudoku, false, sudokuSelected, setSudokuSelected)}
              {sudokuVarResults && renderSudokuResults(sudokuVarResults, pageSudokuVar, setPageSudokuVar, true, sudokuVarSelected, setSudokuVarSelected)}
            </>
          );
        })()}

        {sbResults && (() => {
          const N = sbSize;
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
            10: "bg-indigo-500/20",
            11: "bg-rose-500/20",
            12: "bg-teal-500/20",
          };
          const perPage = 10;
          return (
            <section className="mt-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {sbResults.length}{sbResults.length === 200 ? "+" : ""} {sbResults.length === 1 ? "solution" : "solutions"}
                </h2>
                <button
                  onClick={() => {
                    const items = sbResults.map((sol, i) => {
                      const set = new Set(sol.map(([r, c]) => `${r},${c}`));
                      const rows: string[] = [];
                      for (let r = 0; r < N; r++) {
                        const row: string[] = [];
                        for (let c = 0; c < N; c++) row.push(set.has(`${r},${c}`) ? "★" : ".");
                        rows.push(row.join(" "));
                      }
                      return `#${i + 1}\n${rows.join("\n")}`;
                    }).join("\n\n");
                    copyText(`${items}\n\nSolved via ${window.location.href}.`);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  aria-label="Copy all solutions"
                >
                  {copied ? (<><Check size={14} /> Copied</>) : (<><Copy size={14} /> Copy all</>)}
                </button>
              </div>
              <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sbResults.slice(pageSb * perPage, pageSb * perPage + perPage).map((sol, idx) => {
                  const i = pageSb * perPage + idx;
                  const set = new Set(sol.map(([r, c]) => `${r},${c}`));
                  return (
                    <li key={i} className="overflow-x-auto rounded-lg border bg-card p-3 text-card-foreground">
                      <div className="mb-2 text-xs text-muted-foreground">#{i + 1}</div>
                      <div className="inline-block border-2 border-foreground/70">

                        {Array.from({ length: N }, (_, r) => (
                          <div key={r} className="flex">
                            {Array.from({ length: N }, (_, c) => {
                              const reg = sbRegions[r]?.[c] ?? 0;
                              const bg = REGION_BG[reg] || "bg-muted";
                              const cellSize = N >= 11 ? "h-6 w-6 text-xs" : N >= 9 ? "h-7 w-7 text-sm" : "h-8 w-8 text-base";
                              return (
                                <div key={c} className={`flex items-center justify-center border border-border ${bg} ${cellSize} font-mono font-bold`}>
                                  {set.has(`${r},${c}`) ? "★" : ""}
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
              <Paginator page={pageSb} setPage={setPageSb} total={sbResults.length} perPage={perPage} />
            </section>
          );
        })()}






      </div>

    </div>
  );
}
