import graph4 from "@/data/wordLadder4.json";
import graph5 from "@/data/wordLadder5.json";
import graph6 from "@/data/wordLadder6.json";
import graphSplice from "@/data/wordSplice.json";
import graphWeaverX from "@/data/wordWeaverX.json";
import graphPivots from "@/data/wordPivots.json";
import graphCraftWords from "@/data/wordCraftWords.json";




type Graph = Record<string, string[]>;

export type Mode = 4 | 5 | 6 | "splice" | "weaverx" | "pivots" | "wordiply" | "wordle" | "fibble" | "spellingbee" | "craftwords" | "mastermind" | "marbless" | "dodeku" | "wordpeaks" | "flippingletters" | "worwordle" | "sheetdoku" | "jeffgoldblum" | "sudoku" | "sudokuvariation" | "starbattle" | "shuntle" | "splitle" | "blunderwall" | "doubledabble" | "wrdl" | "threepeat" | "fifteenpuzzle" | "sumplete" | "rotato";
export type WordLength = Mode;

const GRAPHS: Record<string, Graph> = {
  "4": graph4 as Graph,
  "5": graph5 as Graph,
  "6": graph6 as Graph,
  splice: graphSplice as Graph,
  weaverx: graphWeaverX as Graph,
  pivots: graphPivots as Graph,
  craftwords: graphCraftWords as Graph,
  
};

// 0 means variable length (no length validation)
export const MODE_WORD_LENGTH: Record<string, number> = {
  "4": 4,
  "5": 5,
  "6": 6,
  splice: 5,
  weaverx: 0,
  pivots: 6,
  wordiply: 0,
  wordle: 5,
  fibble: 5,
  craftwords: 0,
  mastermind: 5,
  marbless: 0,
  dodeku: 0,
  wordpeaks: 5,
  flippingletters: 5,
  worwordle: 8,
  sheetdoku: 0,
  jeffgoldblum: 12,
  sudoku: 0,
  sudokuvariation: 0,
  starbattle: 0,
  shuntle: 7,
  splitle: 5,
  blunderwall: 7,
  doubledabble: 5,
  wrdl: 5,
  threepeat: 0,
  fifteenpuzzle: 0,
  sumplete: 0,
  rotato: 0,
  
  
};

let _jeffGoldblumWordsCache: string[] | null = null;
async function getJeffGoldblumWords(): Promise<string[]> {
  if (_jeffGoldblumWordsCache) return _jeffGoldblumWordsCache;
  const mod = await import("@/data/jeffGoldblumLeWords.json");
  const words = mod.default as string[];
  _jeffGoldblumWordsCache = [...new Set([...words, "JEFFGOLDBLUM"])];
  return _jeffGoldblumWordsCache;
}

export async function isValidJeffGoldblumWord(w: string): Promise<boolean> {
  const words = await getJeffGoldblumWords();
  return words.includes(w.toUpperCase());
}

let _shuntleWordsCache: string[] | null = null;
async function getShuntleWords(): Promise<string[]> {
  if (_shuntleWordsCache) return _shuntleWordsCache;
  const mod = await import("@/data/shuntleWords.json");
  // Each entry is already exactly 7 characters with spaces as padding.
  _shuntleWordsCache = (mod.default as string[]).map((w) => w.padEnd(7, " ").slice(0, 7));
  return _shuntleWordsCache;
}

export async function isValidShuntleWord(w: string): Promise<boolean> {
  const words = await getShuntleWords();
  const padded = w.toUpperCase().padEnd(7, " ").slice(0, 7);
  return words.includes(padded);
}

export async function shuntleSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<string[]> {
  const words = await getShuntleWords();
  const normGuesses = guesses.map((g) => ({
    word: g.word.toUpperCase().padEnd(7, " ").slice(0, 7),
    pattern: g.pattern,
  }));
  return words.filter((answer) =>
    normGuesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
}

export async function jeffGoldblumLeSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<string[]> {
  const words = await getJeffGoldblumWords();
  return words.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
}

export type SheetdokuFunc = "MAX" | "MIN" | "SUM" | "AVG" | "PROD" | "RANGE";
export interface SheetdokuRegionDef { func: SheetdokuFunc; target: number; }

export function sheetdokuSolve(
  N: number,
  regions: number[][],
  initial: number[][],
  regionDefs: Record<number, SheetdokuRegionDef>,
  maxSolutions = 1000,
): number[][][] {
  const cellsByRegion: Record<number, [number, number][]> = {};
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const reg = regions[r][c];
    (cellsByRegion[reg] ||= []).push([r, c]);
  }
  const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  const rowUsed: Set<number>[] = Array.from({ length: N }, () => new Set());
  const colUsed: Set<number>[] = Array.from({ length: N }, () => new Set());
  const solutions: number[][][] = [];

  const checkRegion = (reg: number): boolean => {
    const def = regionDefs[reg];
    if (!def) return true;
    const cells = cellsByRegion[reg];
    const vals: number[] = [];
    for (const [r, c] of cells) if (grid[r][c] !== 0) vals.push(grid[r][c]);
    if (vals.length === 0) return true;
    const full = vals.length === cells.length;
    if (def.func === "MAX") {
      const m = Math.max(...vals);
      if (m > def.target) return false;
      if (full && m !== def.target) return false;
    } else if (def.func === "MIN") {
      const m = Math.min(...vals);
      if (m < def.target) return false;
      if (full && m !== def.target) return false;
    } else if (def.func === "SUM") {
      const s = vals.reduce((a, b) => a + b, 0);
      if (s > def.target) return false;
      if (full && s !== def.target) return false;
    } else if (def.func === "PROD") {
      const p = vals.reduce((a, b) => a * b, 1);
      if (p > def.target) return false;
      if (full && p !== def.target) return false;
    } else if (def.func === "AVG") {
      if (full) {
        const s = vals.reduce((a, b) => a + b, 0);
        if (s !== def.target * cells.length) return false;
      }
    } else {
      const rng = Math.max(...vals) - Math.min(...vals);
      if (rng > def.target) return false;
      if (full && rng !== def.target) return false;
    }
    return true;
  };

  const bt = (pos: number) => {
    if (solutions.length >= maxSolutions) return;
    if (pos === N * N) { solutions.push(grid.map((r) => [...r])); return; }
    const r = Math.floor(pos / N), c = pos % N;
    const fixed = initial[r][c];
    const tryVal = (v: number) => {
      if (rowUsed[r].has(v) || colUsed[c].has(v)) return;
      grid[r][c] = v; rowUsed[r].add(v); colUsed[c].add(v);
      if (checkRegion(regions[r][c])) bt(pos + 1);
      grid[r][c] = 0; rowUsed[r].delete(v); colUsed[c].delete(v);
    };
    if (fixed !== 0) tryVal(fixed);
    else for (let v = 1; v <= N; v++) tryVal(v);
  };
  bt(0);
  return solutions;
}

export interface SudokuVariations {
  king?: boolean;
  knight?: boolean;
  diagonal?: boolean;
  nonConsecutive?: boolean;
  extraRegions?: number[][] | number[][][]; // 0 = no extra region; non-zero values group cells that must each be unique. May be a single grid or an array of grids.
}

export function sudokuSolve(
  board: number[][],
  regions: number[][],
  maxSolutions = 200,
  variations: SudokuVariations = {},
): number[][][] {
  const N = 9;
  const b = board.map((r) => r.slice());
  const rowUsed: Set<number>[] = Array.from({ length: N }, () => new Set());
  const colUsed: Set<number>[] = Array.from({ length: N }, () => new Set());
  const regUsed: Map<number, Set<number>> = new Map();
  const { king, knight, diagonal, nonConsecutive, extraRegions } = variations;
  // Normalize extraRegions into an array of grids
  const extraLayers: number[][][] = (() => {
    if (!extraRegions) return [];
    const arr = extraRegions as unknown as (number[][] | number[][][]);
    if (arr.length === 0) return [];
    const first = arr[0] as unknown;
    if (Array.isArray(first) && Array.isArray((first as unknown[])[0])) {
      return arr as number[][][];
    }
    return [arr as number[][]];
  })();
  const extraUsedLayers: Map<number, Set<number>>[] = extraLayers.map(() => new Map());
  const extraAt = (layerIdx: number, r: number, c: number): number => extraLayers[layerIdx][r][c] || 0;

  const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
  const checkExtra = (r: number, c: number, v: number): boolean => {
    if (king) {
      const moves: [number, number][] = [[r+1,c+1],[r+1,c-1],[r-1,c+1],[r-1,c-1]];
      for (const [rr, cc] of moves) if (inBounds(rr, cc) && b[rr][cc] === v) return false;
    }
    if (knight) {
      const moves: [number, number][] = [[r+2,c+1],[r+2,c-1],[r-2,c+1],[r-2,c-1],[r+1,c+2],[r+1,c-2],[r-1,c+2],[r-1,c-2]];
      for (const [rr, cc] of moves) if (inBounds(rr, cc) && b[rr][cc] === v) return false;
    }
    if (diagonal) {
      if (r === c) {
        for (let k = 0; k < N; k++) if (k !== r && b[k][k] === v) return false;
      }
      if (r + c === N - 1) {
        for (let k = 0; k < N; k++) {
          const rr = N - 1 - k, cc = k;
          if (rr !== r && b[rr][cc] === v) return false;
        }
      }
    }
    if (nonConsecutive) {
      const moves: [number, number][] = [[r,c+1],[r,c-1],[r+1,c],[r-1,c]];
      for (const [rr, cc] of moves) {
        if (!inBounds(rr, cc)) continue;
        const adj = b[rr][cc];
        if (adj !== 0 && Math.abs(adj - v) === 1) return false;
      }
    }
    return true;
  };

  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const reg = regions[r][c];
    if (!regUsed.has(reg)) regUsed.set(reg, new Set());
    for (let li = 0; li < extraLayers.length; li++) {
      const er = extraAt(li, r, c);
      if (er && !extraUsedLayers[li].has(er)) extraUsedLayers[li].set(er, new Set());
    }
    const v = b[r][c];
    if (v !== 0) {
      if (rowUsed[r].has(v) || colUsed[c].has(v) || regUsed.get(reg)!.has(v)) return [];
      for (let li = 0; li < extraLayers.length; li++) {
        const er = extraAt(li, r, c);
        if (er && extraUsedLayers[li].get(er)!.has(v)) return [];
      }
      rowUsed[r].add(v); colUsed[c].add(v); regUsed.get(reg)!.add(v);
      for (let li = 0; li < extraLayers.length; li++) {
        const er = extraAt(li, r, c);
        if (er) extraUsedLayers[li].get(er)!.add(v);
      }
    }
  }
  // Validate pre-filled against extras
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = b[r][c];
    if (v !== 0) {
      b[r][c] = 0;
      const ok = checkExtra(r, c, v);
      b[r][c] = v;
      if (!ok) return [];
    }
  }
  const solutions: number[][][] = [];
  const findEmpty = (): [number, number] | null => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (b[r][c] === 0) return [r, c];
    return null;
  };
  const bt = () => {
    if (solutions.length >= maxSolutions) return;
    const e = findEmpty();
    if (!e) { solutions.push(b.map((r) => r.slice())); return; }
    const [r, c] = e;
    const reg = regions[r][c];
    const ru = rowUsed[r], cu = colUsed[c], gu = regUsed.get(reg)!;
    const eus: Set<number>[] = [];
    for (let li = 0; li < extraLayers.length; li++) {
      const er = extraAt(li, r, c);
      if (er) eus.push(extraUsedLayers[li].get(er)!);
    }
    for (let v = 1; v <= 9; v++) {
      if (ru.has(v) || cu.has(v) || gu.has(v)) continue;
      let blocked = false;
      for (const eu of eus) if (eu.has(v)) { blocked = true; break; }
      if (blocked) continue;
      if (!checkExtra(r, c, v)) continue;
      b[r][c] = v; ru.add(v); cu.add(v); gu.add(v); for (const eu of eus) eu.add(v);
      bt();
      b[r][c] = 0; ru.delete(v); cu.delete(v); gu.delete(v); for (const eu of eus) eu.delete(v);
      if (solutions.length >= maxSolutions) return;
    }
  };
  bt();
  return solutions;
}



let _worwordleWordsCache: string[] | null = null;
async function getWorwordleWords(): Promise<string[]> {
  if (_worwordleWordsCache) return _worwordleWordsCache;
  const mod = await import("@/data/worwordleWords.json");
  _worwordleWordsCache = mod.default as string[];
  return _worwordleWordsCache;
}

export async function worwordleSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<string[]> {
  const words = await getWorwordleWords();
  return words.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
}

export function worwordleSplit(word: string): [string, string] {
  return [word.slice(0, 5), word.slice(-5)];
}


export async function flippingLettersSolve(
  allowedLetters: string[],
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<{ flippable: string[]; answers: string[] }> {
  const allowed = new Set(allowedLetters.filter(Boolean).map((l) => l.toUpperCase()));
  const words = await getFiveLetterWords();
  const flippable = words.filter((w) => {
    for (const c of w) if (!allowed.has(c)) return false;
    return true;
  });
  const answers = flippable.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
  return { flippable, answers };
}


export type WordPeaksDirection = "NONE" | "CORRECT" | "BEFORE" | "AFTER";

export async function wordPeaksSolve(
  guesses: { word: string; pattern: WordPeaksDirection[] }[],
): Promise<string[]> {
  const words = await getFiveLetterWords();
  return words.filter((answer) =>
    guesses.every((g) => {
      const w = g.word.toUpperCase();
      for (let i = 0; i < 5; i++) {
        const a = answer.charCodeAt(i);
        const c = w.charCodeAt(i);
        const d = g.pattern[i];
        if (d === "CORRECT") { if (a !== c) return false; }
        else if (d === "BEFORE") { if (a >= c) return false; }
        else { if (a <= c) return false; }
      }
      return true;
    }),
  );
}


export type DodekuCell = "X" | number | 0;

export function dodekuSolve(
  initialGrid: DodekuCell[][],
  rowSums: (number | null)[],
  colSums: (number | null)[],
  availableTiles: number[],
  maxSolutions = 1000,
): DodekuCell[][][] {
  const rows = initialGrid.length;
  const cols = initialGrid[0].length;
  const grid: DodekuCell[][] = initialGrid.map((r) => r.slice());
  const empties: [number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 0) empties.push([r, c]);

  const used = new Set<number>();

  const isNum = (v: DodekuCell): v is number => typeof v === "number" && v !== 0;
  const rowSum = (r: number) => grid[r].reduce<number>((s, v) => s + (isNum(v) ? v : 0), 0);
  const colSum = (c: number) => {
    let t = 0;
    for (let r = 0; r < rows; r++) { const v = grid[r][c]; if (isNum(v)) t += v; }
    return t;
  };
  const rowMissing = (r: number) => grid[r].filter((v) => v === 0).length;
  const colMissing = (c: number) => {
    let n = 0;
    for (let r = 0; r < rows; r++) if (grid[r][c] === 0) n++;
    return n;
  };

  const feasible = (): boolean => {
    const remaining = availableTiles.filter((t) => !used.has(t)).sort((a, b) => a - b);
    const check = (target: number | null, current: number, missing: number) => {
      if (target == null) return true;
      if (missing === 0) return current === target;
      const small = remaining.slice(0, missing).reduce((a, b) => a + b, 0);
      const large = remaining.slice(-missing).reduce((a, b) => a + b, 0);
      return current + small <= target && current + large >= target;
    };
    for (let r = 0; r < rows; r++) if (!check(rowSums[r], rowSum(r), rowMissing(r))) return false;
    for (let c = 0; c < cols; c++) if (!check(colSums[c], colSum(c), colMissing(c))) return false;
    return true;
  };

  const solutions: DodekuCell[][][] = [];
  const backtrack = (i: number): void => {
    if (solutions.length >= maxSolutions) return;
    if (i === empties.length) {
      if (feasible()) solutions.push(grid.map((r) => r.slice()));
      return;
    }
    const [r, c] = empties[i];
    for (const t of availableTiles) {
      if (used.has(t)) continue;
      grid[r][c] = t;
      used.add(t);
      if (feasible()) backtrack(i + 1);
      used.delete(t);
      grid[r][c] = 0;
      if (solutions.length >= maxSolutions) return;
    }
  };

  backtrack(0);
  return solutions;
}


export type WordleColor = "GREY" | "GREEN" | "YELLOW";

export function wordleOutput(guess: string, answer: string): WordleColor[] {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  const n = a.length;
  const result: WordleColor[] = Array(n).fill("GREY");
  const remaining: (string | null)[] = a.split("");
  for (let i = 0; i < n; i++) {
    if (g[i] === a[i]) {
      result[i] = "GREEN";
      remaining[i] = null;
    }
  }
  for (let i = 0; i < n; i++) {
    if (result[i] === "GREEN") continue;
    const idx = remaining.indexOf(g[i]);
    if (idx !== -1) {
      result[i] = "YELLOW";
      remaining[idx] = null;
    }
  }
  return result;
}

export async function isValid5LetterWord(w: string): Promise<boolean> {
  const words = await getFiveLetterWords();
  return words.includes(w.toUpperCase());
}

export async function wordleSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<string[]> {
  const words = await getFiveLetterWords();
  return words.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
}

let _wrdlWordsCache: Record<string, string[]> | null = null;
async function getWrdlWords(): Promise<Record<string, string[]>> {
  if (_wrdlWordsCache) return _wrdlWordsCache;
  const res = await fetch("/wrdlWords.json");
  _wrdlWordsCache = (await res.json()) as Record<string, string[]>;
  return _wrdlWordsCache;
}

export async function isValidWrdlKey(w: string): Promise<boolean> {
  const map = await getWrdlWords();
  return Object.prototype.hasOwnProperty.call(map, w.toUpperCase());
}

export async function wrdlSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<[string, string[]][]> {
  const map = await getWrdlWords();
  const keys = Object.keys(map);
  const matched = keys.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
  return matched.map((k) => [k, map[k]]);
}



export async function fibbleSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<string[]> {
  // In Fibble, exactly one tile lies in each guess row.
  // Additionally, candidate true patterns that are all-GREEN are excluded
  // (i.e. guess === answer is never a valid solution for a row).
  const words = await getFiveLetterWords();
  return words.filter((answer) =>
    guesses.every((g) => {
      if (g.word === answer) return false;
      const out = wordleOutput(g.word, answer);
      let mismatches = 0;
      for (let i = 0; i < out.length; i++) {
        if (out[i] !== g.pattern[i]) mismatches++;
        if (mismatches > 1) return false;
      }
      return mismatches === 1;
    }),
  );
}

export function pivotsBracketRange(prev: string, curr: string): [number, number] | null {
  for (let i = 0; i <= 2; i++) {
    const p = prev.slice(i, i + 4);
    const c = curr.slice(i, i + 4);
    if (p.split("").reverse().join("") === c) {
      return [i, i + 3];
    }
  }
  return null;
}

export async function mastermindSolve(
  guess: string,
  greens: number,
  yellows: number,
  length = 5,
): Promise<string[]> {
  const g = guess.toUpperCase();
  if (g.length !== length) return [];
  const words = await getNLetterWords(length);
  return words.filter((answer) => {
    const out = wordleOutput(g, answer);
    let gc = 0, yc = 0;
    for (const c of out) {
      if (c === "GREEN") gc++;
      else if (c === "YELLOW") yc++;
    }
    return gc === greens && yc === yellows;
  });
}

const _nLetterCache: Record<number, string[]> = {};
async function getNLetterWords(n: number): Promise<string[]> {
  if (_nLetterCache[n]) return _nLetterCache[n];
  const all = await getAllEnglishWords();
  _nLetterCache[n] = all.filter((w) => w.length === n);
  return _nLetterCache[n];
}

export async function isValidNLetterWord(w: string, n: number): Promise<boolean> {
  const words = await getNLetterWords(n);
  return words.includes(w.toUpperCase());
}

export type MarblessSolution = { words: string[]; moves: number[] };

export async function marblessSolve(columns: string[][]): Promise<MarblessSolution[]> {
  const numCols = columns.length;
  if (numCols < 2 || numCols > 4) return [];
  const lettersPerCol = 5;
  for (const c of columns) if (c.length !== lettersPerCol) return [];
  const cols = columns.map((c) => c.map((x) => x.toUpperCase()));
  const words = await getFiveLetterWords();
  const wordSet = new Set(words);
  const prefixes = new Set<string>();
  prefixes.add("");
  for (const w of words) for (let i = 1; i <= 5; i++) prefixes.add(w.slice(0, i));

  const total = numCols * lettersPerCol;
  const results: MarblessSolution[] = [];
  const positions = new Array(numCols).fill(0);
  const letters: string[] = [];
  const moves: number[] = [];

  const backtrack = () => {
    const n = letters.length;
    const completed = Math.floor(n / 5);
    // Validate last completed word if just completed
    if (n > 0 && n % 5 === 0) {
      const w = letters.slice(5 * (completed - 1), 5 * completed).join("");
      if (!wordSet.has(w)) return;
    } else if (n > 0) {
      const partialLen = n % 5;
      const partial = letters.slice(n - partialLen).join("");
      if (!prefixes.has(partial)) return;
    }
    if (n === total) {
      const ws: string[] = [];
      for (let i = 0; i < total / 5; i++) ws.push(letters.slice(5 * i, 5 * i + 5).join(""));
      results.push({ words: ws, moves: moves.slice() });
      return;
    }
    for (let col = 0; col < numCols; col++) {
      if (positions[col] < lettersPerCol) {
        const ch = cols[col][positions[col]];
        positions[col]++;
        letters.push(ch);
        moves.push(col + 1);
        backtrack();
        letters.pop();
        moves.pop();
        positions[col]--;
      }
    }
  };
  backtrack();
  return results;
}



export function formatPivotsWord(curr: string, bracket: [number, number] | null): string {
  if (!bracket) return curr;
  const [start, end] = bracket;
  return curr.slice(0, start) + "(" + curr.slice(start, end + 1) + ")" + curr.slice(end + 1);
}

let _allEnglishWordsCache: string[] | null = null;
let _fiveLetterWordsCache: string[] | null = null;
async function getAllEnglishWords(): Promise<string[]> {
  if (_allEnglishWordsCache) return _allEnglishWordsCache;
  const mod = await import("@/data/allEnglishWords.json");
  _allEnglishWordsCache = mod.default as string[];
  return _allEnglishWordsCache;
}
async function getFiveLetterWords(): Promise<string[]> {
  if (_fiveLetterWordsCache) return _fiveLetterWordsCache;
  const all = await getAllEnglishWords();
  _fiveLetterWordsCache = all.filter((w) => w.length === 5);
  return _fiveLetterWordsCache;
}

let frequencyMap: Record<string, number> = {};
let _freqLoadPromise: Promise<void> | null = null;

export function ensureFrequenciesLoaded(): Promise<void> {
  if (!_freqLoadPromise) {
    _freqLoadPromise =
      typeof fetch === "undefined"
        ? Promise.resolve()
        : fetch("/wordFrequencies.json")
            .then((r) => r.json())
            .then((d: Record<string, number>) => { frequencyMap = d; })
            .catch(() => {});
  }
  return _freqLoadPromise;
}

export function getWordFrequency(word: string): number {
  return frequencyMap[word.toUpperCase()] ?? 0;
}


export function sortWordsByFrequency(words: string[], mostCommonFirst = true): string[] {
  const groups = new Map<number, string[]>();
  for (const w of words) {
    const f = getWordFrequency(w);
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f)!.push(w);
  }
  const entries = Array.from(groups.entries());
  entries.sort((a, b) => (mostCommonFirst ? b[0] - a[0] : a[0] - b[0]));
  const result: string[] = [];
  for (const [, ws] of entries) {
    ws.sort();
    result.push(...ws);
  }
  return result;
}

export async function wordiplySearch(substring: string): Promise<[number, string[]][]> {
  const sub = substring.toUpperCase();
  if (!sub) return [];
  const words = await getAllEnglishWords();
  const groups = new Map<number, string[]>();
  for (const w of words) {
    if (w.includes(sub)) {
      const extra = w.length - sub.length;
      if (!groups.has(extra)) groups.set(extra, []);
      groups.get(extra)!.push(w);
    }
  }
  return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
}

export async function spellingBeeSolve(
  middleLetter: string,
  otherLetters: string,
): Promise<[number, string[]][]> {
  const middle = middleLetter.toUpperCase();
  const others = otherLetters.toUpperCase();
  const allowed = new Set((middle + others).split(""));
  const words = await getAllEnglishWords();
  const groups = new Map<number, string[]>();
  const score = (w: string) => (w.length - 3) + (new Set(w).size === 7 ? 7 : 0);
  for (const w of words) {
    if (w.length < 4) continue;
    if (!w.includes(middle)) continue;
    let ok = true;
    for (let i = 0; i < w.length; i++) {
      if (!allowed.has(w[i])) { ok = false; break; }
    }
    if (!ok) continue;
    const s = score(w);
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s)!.push(w);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
}

export function isValidWord(w: string, mode: Mode): boolean {
  const G = GRAPHS[String(mode)];
  return Object.prototype.hasOwnProperty.call(G, w.toUpperCase());
}

export function getRandomWords(mode: Mode, count = 2): string[] {
  const G = GRAPHS[String(mode)];
  const keys = Object.keys(G);
  if (keys.length < count) return keys;
  const pool = keys.slice();
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function findAllShortestPaths(
  start: string,
  goal: string,
  mode: Mode,
): string[][] {
  const G = GRAPHS[String(mode)];
  const s = start.toUpperCase();
  const g = goal.toUpperCase();
  if (!isValidWord(s, mode) || !isValidWord(g, mode)) return [];
  if (s === g) return [[s]];

  const dist = new Map<string, number>();
  const parents = new Map<string, string[]>();
  dist.set(s, 0);
  let frontier = [s];
  let found = false;
  let level = 0;

  while (frontier.length && !found) {
    level++;
    const nextSet = new Map<string, string[]>();
    for (const node of frontier) {
      const neighbors = G[node] || [];
      for (const nb of neighbors) {
        const d = dist.get(nb);
        if (d === undefined) {
          if (!nextSet.has(nb)) nextSet.set(nb, []);
          nextSet.get(nb)!.push(node);
        } else if (d === level) {
          nextSet.get(nb)?.push(node);
        }
      }
    }
    if (nextSet.size === 0) break;
    for (const [node, ps] of nextSet) {
      dist.set(node, level);
      parents.set(node, ps);
      if (node === g) found = true;
    }
    frontier = Array.from(nextSet.keys());
  }

  if (!found) return [];

  const paths: string[][] = [];
  const build = (node: string, path: string[]) => {
    if (node === s) {
      paths.push([s, ...path]);
      return;
    }
    for (const p of parents.get(node) || []) {
      build(p, [node, ...path]);
    }
  };
  build(g, []);
  return paths;
}


let _splitleCache: { map: Record<string, string[]>; strategic: string[][] } | null = null;
async function getSplitleData(): Promise<{ map: Record<string, string[]>; strategic: string[][] }> {
  if (_splitleCache) return _splitleCache;
  const mod = await import("@/data/splitleWords.json");
  _splitleCache = mod.default as { map: Record<string, string[]>; strategic: string[][] };
  return _splitleCache;
}

export async function isValidSplitleHalf(word: string): Promise<boolean> {
  const data = await getSplitleData();
  return Object.prototype.hasOwnProperty.call(data.map, word.toUpperCase());
}

export async function getSplitleStrategicWords(): Promise<string[][]> {
  const data = await getSplitleData();
  return data.strategic;
}

export async function splitleSolve(
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<[string, string[]][]> {
  const data = await getSplitleData();
  const keys = Object.keys(data.map);
  const matching = keys.filter((key) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word.toUpperCase(), key);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
  matching.sort();
  return matching.map((k) => [k, data.map[k]]);
}

export async function getSplitleOtherHalves(givenHalf: string): Promise<Record<string, string>> {
  const data = await getSplitleData();
  const half = givenHalf.toUpperCase();
  const words = data.map[half] || [];
  const out: Record<string, string> = {};
  for (const w of words) {
    const idx = w.indexOf(half);
    const other = idx === 0 ? w.slice(5) : w.slice(0, 5);
    out[other] = w;
  }
  return out;
}

export async function splitleP2Solve(
  givenHalf: string,
  guesses: { word: string; pattern: WordleColor[] }[],
): Promise<[string, string][]> {
  const map = await getSplitleOtherHalves(givenHalf);
  const others = Object.keys(map);
  const matching = others.filter((other) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word.toUpperCase(), other);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
    }),
  );
  matching.sort();
  return matching.map((k) => [k, map[k]]);
}

export type ThreepeatSolution = [string, string, string, string];

export async function threepeatSolve(
  word1: string,
  word2: string,
  word3: string,
): Promise<ThreepeatSolution[]> {
  const norm = (w: string) =>
    w.toUpperCase().split("").map((c) => (c === " " ? "_" : c)).join("");
  const w1 = norm(word1);
  const w2 = norm(word2);
  const w3 = norm(word3);
  const countBlanks = (s: string) => (s.match(/_/g) || []).length;
  if (
    countBlanks(w1) !== countBlanks(w2) ||
    countBlanks(w2) !== countBlanks(w3)
  ) {
    throw new Error("The number of blanks in each of the three words are not equal.");
  }
  const words = await getAllEnglishWords();
  const findFills = (pattern: string): Map<string, string> => {
    const len = pattern.length;
    const map = new Map<string, string>();
    for (const raw of words) {
      const w = raw.toUpperCase();
      if (w.length !== len) continue;
      let ok = true;
      let fill = "";
      for (let i = 0; i < len; i++) {
        const p = pattern[i];
        if (p === "_") fill += w[i];
        else if (p !== w[i]) { ok = false; break; }
      }
      if (ok && !map.has(fill)) map.set(fill, w);
    }
    return map;
  };
  const m1 = findFills(w1);
  const m2 = findFills(w2);
  const m3 = findFills(w3);
  const results: ThreepeatSolution[] = [];
  for (const [fill, wA] of m1) {
    const wB = m2.get(fill);
    const wC = m3.get(fill);
    if (wB && wC) results.push([fill, wA, wB, wC]);
  }
  results.sort((a, b) => a[0].localeCompare(b[0]));
  return results;
}

export type StarBattleSolution = Array<[number, number]>;

export function starBattleSolve(
  regions: number[][],
  starsPerUnit: number,
  maxSolutions = 200,
): StarBattleSolution[] {
  const R = regions.length;
  const C = regions[0]?.length ?? 0;
  const k = starsPerUnit;
  if (R === 0 || C === 0 || k <= 0) return [];
  for (const row of regions) if (row.length !== C) return [];

  const regionCells = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const reg = regions[r][c];
      if (!regionCells.has(reg)) regionCells.set(reg, []);
      regionCells.get(reg)!.push([r, c]);
    }
  }
  const rowCount = new Array<number>(R).fill(0);
  const colCount = new Array<number>(C).fill(0);
  const regCount = new Map<number, number>();
  for (const key of regionCells.keys()) regCount.set(key, 0);
  const starsGrid: boolean[][] = Array.from({ length: R }, () => new Array<boolean>(C).fill(false));
  const solutions: StarBattleSolution[] = [];

  const canPlace = (r: number, c: number): boolean => {
    if (rowCount[r] >= k || colCount[c] >= k) return false;
    const reg = regions[r][c];
    if ((regCount.get(reg) || 0) >= k) return false;
    if (starsGrid[r][c]) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue;
        if (starsGrid[rr][cc]) return false;
      }
    }
    return true;
  };
  const place = (r: number, c: number) => {
    starsGrid[r][c] = true; rowCount[r]++; colCount[c]++;
    const reg = regions[r][c]; regCount.set(reg, (regCount.get(reg) || 0) + 1);
  };
  const remove = (r: number, c: number) => {
    starsGrid[r][c] = false; rowCount[r]--; colCount[c]--;
    const reg = regions[r][c]; regCount.set(reg, (regCount.get(reg) || 0) - 1);
  };
  const rowCandidates = (r: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (let c = 0; c < C; c++) if (canPlace(r, c)) out.push([r, c]);
    return out;
  };
  const feasible = (): boolean => {
    for (let r = 0; r < R; r++) {
      const need = k - rowCount[r];
      if (need < 0) return false;
      if (need > 0 && rowCandidates(r).length < need) return false;
    }
    for (let c = 0; c < C; c++) if (colCount[c] > k) return false;
    for (const [reg, cells] of regionCells) {
      const need = k - (regCount.get(reg) || 0);
      if (need < 0) return false;
      if (need > 0) {
        let poss = 0;
        for (const [r, c] of cells) if (canPlace(r, c)) poss++;
        if (poss < need) return false;
      }
    }
    return true;
  };
  const chooseRow = (): { row: number; cands: Array<[number, number]> } | null => {
    let best = -1;
    let bestCands: Array<[number, number]> | null = null;
    for (let r = 0; r < R; r++) {
      if (rowCount[r] < k) {
        const cand = rowCandidates(r);
        if (bestCands === null || cand.length < bestCands.length) {
          best = r; bestCands = cand;
        }
      }
    }
    if (best < 0 || bestCands === null) return null;
    return { row: best, cands: bestCands };
  };
  const backtrack = () => {
    if (solutions.length >= maxSolutions) return;
    if (rowCount.every((x) => x === k)) {
      if (colCount.every((x) => x === k) && Array.from(regCount.values()).every((v) => v === k)) {
        const sol: StarBattleSolution = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (starsGrid[r][c]) sol.push([r, c]);
        solutions.push(sol);
      }
      return;
    }
    if (!feasible()) return;
    const pick = chooseRow();
    if (!pick) return;
    const need = k - rowCount[pick.row];
    const cands = pick.cands;
    const rec = (start: number, left: number) => {
      if (solutions.length >= maxSolutions) return;
      if (left === 0) { backtrack(); return; }
      for (let i = start; i < cands.length; i++) {
        const [r, c] = cands[i];
        if (canPlace(r, c)) {
          place(r, c);
          rec(i + 1, left - 1);
          remove(r, c);
          if (solutions.length >= maxSolutions) return;
        }
      }
    };
    rec(0, need);
  };
  backtrack();
  return solutions;
}

// ---------------- 15-Puzzle (sliding tile) solver ----------------
// Board is a flat array of length n*n. 0 represents the blank.
// Solved state is [1, 2, ..., n*n - 1, 0].
export type FifteenPuzzleResult = {
  states: number[][]; // states[0] is initial, states[k] after k moves
  moves: string[];    // "Up" | "Down" | "Left" | "Right" — direction the blank moves
  tileMoves: number[]; // tile value moved into the blank at each step
};

export function fifteenPuzzleSolvable(board: number[], n = 4): boolean {
  const tiles = board.filter((v) => v !== 0);
  let inv = 0;
  for (let i = 0; i < tiles.length; i++)
    for (let j = i + 1; j < tiles.length; j++)
      if (tiles[i] > tiles[j]) inv++;
  if (n % 2 === 1) return inv % 2 === 0;
  const blankIdx = board.indexOf(0);
  const blankRowFromBottom = n - Math.floor(blankIdx / n);
  return (inv + blankRowFromBottom) % 2 === 1;
}

function manhattanPlusLC(board: number[], n: number, goalPos: Int8Array): number {
  let d = 0;
  const rowTiles: number[][] = Array.from({ length: n }, () => []);
  const colTiles: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < board.length; i++) {
    const v = board[i];
    if (v === 0) continue;
    const gi = goalPos[v];
    const gr = (gi / n) | 0, gc = gi % n;
    const r = (i / n) | 0, c = i % n;
    d += Math.abs(gr - r) + Math.abs(gc - c);
    if (gr === r) rowTiles[r].push(gc);
    if (gc === c) colTiles[c].push(gr);
  }
  const lc = (arr: number[]) => {
    let confl = 0;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        if (arr[i] > arr[j]) confl++;
    return confl;
  };
  for (let i = 0; i < n; i++) d += 2 * (lc(rowTiles[i]) + lc(colTiles[i]));
  return d;
}

// ---- Rudimentary staged (human-style) solver, used for larger boards ----
type FpCtx = {
  n: number;
  board: number[];
  locked: Set<number>;
  states: number[][];
  moves: string[];
  tileMoves: number[];
};

const FP_DIR_NAME = (from: number, to: number, n: number): string => {
  const fr = (from / n) | 0, fc = from % n;
  const tr = (to / n) | 0, tc = to % n;
  if (tr < fr) return "Up";
  if (tr > fr) return "Down";
  if (tc < fc) return "Left";
  return "Right";
};

/** Slide the tile at `cell` into the adjacent blank. */
function fpSlide(ctx: FpCtx, cell: number) {
  const blank = ctx.board.indexOf(0);
  const tile = ctx.board[cell];
  ctx.board[blank] = tile;
  ctx.board[cell] = 0;
  ctx.states.push(ctx.board.slice());
  ctx.moves.push(FP_DIR_NAME(blank, cell, ctx.n));
  ctx.tileMoves.push(tile);
}

/** Walk the blank to `target` without disturbing locked cells or `avoid`. */
function fpMoveBlank(ctx: FpCtx, target: number, avoid: number): boolean {
  const { n, board, locked } = ctx;
  const start = board.indexOf(0);
  if (start === target) return true;
  const prev = new Map<number, number>();
  const queue = [start];
  const seen = new Set<number>([start]);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === target) break;
    const r = (cur / n) | 0, c = cur % n;
    const nbrs = [
      r > 0 ? cur - n : -1,
      r < n - 1 ? cur + n : -1,
      c > 0 ? cur - 1 : -1,
      c < n - 1 ? cur + 1 : -1,
    ];
    for (const nb of nbrs) {
      if (nb < 0 || seen.has(nb) || locked.has(nb) || nb === avoid) continue;
      seen.add(nb);
      prev.set(nb, cur);
      queue.push(nb);
    }
  }
  if (!seen.has(target)) return false;
  const path: number[] = [];
  let cur = target;
  while (cur !== start) {
    path.push(cur);
    cur = prev.get(cur)!;
  }
  path.reverse();
  for (const cell of path) fpSlide(ctx, cell);
  return true;
}

/** Move `tile` to `target`, keeping locked cells intact. */
function fpPlaceTile(ctx: FpCtx, tile: number, target: number): boolean {
  const { n } = ctx;
  for (let guard = 0; guard < 4 * n * n; guard++) {
    const cur = ctx.board.indexOf(tile);
    if (cur === target) return true;
    const cr = (cur / n) | 0, cc = cur % n;
    const tr = (target / n) | 0, tc = target % n;
    const next = cc !== tc ? cur + Math.sign(tc - cc) : cur + n * Math.sign(tr - cr);
    if (!fpMoveBlank(ctx, next, cur)) return false;
    fpSlide(ctx, cur);
  }
  return false;
}

function fpSolveStaged(initial: number[], n: number): FifteenPuzzleResult | null {
  const ctx: FpCtx = {
    n,
    board: initial.slice(),
    locked: new Set<number>(),
    states: [initial.slice()],
    moves: [],
    tileMoves: [],
  };
  const at = (r: number, c: number) => r * n + c;
  const goalTile = (r: number, c: number) => {
    const idx = r * n + c;
    return idx === n * n - 1 ? 0 : idx + 1;
  };

  // Phase 1: solve rows top-down until two rows remain.
  for (let r = 0; r <= n - 3; r++) {
    for (let c = 0; c <= n - 3; c++) {
      const tile = goalTile(r, c);
      if (ctx.board[at(r, c)] !== tile) {
        if (!fpPlaceTile(ctx, tile, at(r, c))) return null;
      }
      ctx.locked.add(at(r, c));
    }
    // Last two tiles of the row need the rotate maneuver.
    const t1 = goalTile(r, n - 2), t2 = goalTile(r, n - 1);
    if (!(ctx.board[at(r, n - 2)] === t1 && ctx.board[at(r, n - 1)] === t2)) {
      if (ctx.board[at(r, n - 2)] === t1) {
        // Break the false placement so the maneuver can run.
        if (!fpMoveBlank(ctx, at(r + 1, n - 2), at(r, n - 2))) return null;
        fpSlide(ctx, at(r, n - 2));
      }
      if (!fpPlaceTile(ctx, t1, at(r, n - 1))) return null;
      ctx.locked.add(at(r, n - 1));
      if (!fpPlaceTile(ctx, t2, at(r + 1, n - 1))) return null;
      ctx.locked.delete(at(r, n - 1));
      ctx.locked.add(at(r + 1, n - 1));
      if (!fpMoveBlank(ctx, at(r, n - 2), at(r, n - 1))) return null;
      ctx.locked.delete(at(r + 1, n - 1));
      fpSlide(ctx, at(r, n - 1));
      fpSlide(ctx, at(r + 1, n - 1));
    }
    ctx.locked.add(at(r, n - 2));
    ctx.locked.add(at(r, n - 1));
  }

  // Phase 2: solve the remaining two rows column by column.
  const top = n - 2;
  for (let c = 0; c <= n - 3; c++) {
    const t1 = goalTile(top, c), t2 = goalTile(top + 1, c);
    if (!(ctx.board[at(top, c)] === t1 && ctx.board[at(top + 1, c)] === t2)) {
      if (ctx.board[at(top, c)] === t1) {
        if (!fpMoveBlank(ctx, at(top, c + 1), at(top, c))) return null;
        fpSlide(ctx, at(top, c));
      }
      if (!fpPlaceTile(ctx, t1, at(top + 1, c))) return null;
      ctx.locked.add(at(top + 1, c));
      if (!fpPlaceTile(ctx, t2, at(top + 1, c + 1))) return null;
      ctx.locked.delete(at(top + 1, c));
      ctx.locked.add(at(top + 1, c + 1));
      if (!fpMoveBlank(ctx, at(top, c), at(top + 1, c))) return null;
      ctx.locked.delete(at(top + 1, c + 1));
      fpSlide(ctx, at(top + 1, c));
      fpSlide(ctx, at(top + 1, c + 1));
    }
    ctx.locked.add(at(top, c));
    ctx.locked.add(at(top + 1, c));
  }

  // Phase 3: rotate the final 2x2 into place.
  const cells = [at(top, n - 2), at(top, n - 1), at(top + 1, n - 1), at(top + 1, n - 2)];
  const isSolved = () => ctx.board.every((v, i) => v === (i === n * n - 1 ? 0 : i + 1));
  if (!fpMoveBlank(ctx, at(top + 1, n - 1), -1)) return null;
  for (let k = 0; k < 4 && !isSolved(); k++) {
    const blank = ctx.board.indexOf(0);
    const pos = cells.indexOf(blank);
    if (pos === -1) return null;
    fpSlide(ctx, cells[(pos + 1) % 4]);
    fpSlide(ctx, cells[(pos + 2) % 4]);
    fpSlide(ctx, cells[(pos + 3) % 4]);
  }
  if (!isSolved()) return null;
  return { states: ctx.states, moves: ctx.moves, tileMoves: ctx.tileMoves };
}

// IDA* solver. Returns null if not solvable or exceeds node cap.
export function fifteenPuzzleSolve(initial: number[], n = 4, nodeCap = 80_000_000): FifteenPuzzleResult | null {
  if (initial.length !== n * n) return null;
  if (!fifteenPuzzleSolvable(initial, n)) return null;
  if (n >= 5) return fpSolveStaged(initial, n);
  const goalPos = new Int8Array(n * n);
  for (let v = 1; v < n * n; v++) goalPos[v] = v - 1;
  goalPos[0] = n * n - 1;

  const board = initial.slice();
  const path: number[][] = [board.slice()];
  const moves: string[] = [];
  const tileMoves: number[] = [];
  const DIRS: { dr: number; dc: number; name: string; opp: number }[] = [
    { dr: -1, dc: 0, name: "Up", opp: 1 },
    { dr: 1, dc: 0, name: "Down", opp: 0 },
    { dr: 0, dc: -1, name: "Left", opp: 3 },
    { dr: 0, dc: 1, name: "Right", opp: 2 },
  ];
  let evaluated = 0;
  const FOUND = -1;

  const search = (g: number, bound: number, blankIdx: number, lastDir: number): number => {
    evaluated++;
    if (evaluated > nodeCap) return -2;
    const h = manhattanPlusLC(board, n, goalPos);
    const f = g + h;
    if (f > bound) return f;
    if (h === 0) return FOUND;
    let min = Infinity;
    const br = (blankIdx / n) | 0, bc = blankIdx % n;
    for (let d = 0; d < 4; d++) {
      if (d === lastDir) continue;
      const nr = br + DIRS[d].dr, nc = bc + DIRS[d].dc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
      const ni = nr * n + nc;
      const movedTile = board[ni];
      board[blankIdx] = board[ni];
      board[ni] = 0;
      path.push(board.slice());
      moves.push(DIRS[d].name);
      tileMoves.push(movedTile);
      const t = search(g + 1, bound, ni, DIRS[d].opp);
      if (t === FOUND) return FOUND;
      if (t === -2) return -2;
      if (t < min) min = t;
      board[ni] = board[blankIdx];
      board[blankIdx] = 0;
      path.pop();
      moves.pop();
      tileMoves.pop();
    }
    return min === Infinity ? -1 : min;
  };

  let bound = manhattanPlusLC(board, n, goalPos);
  const blank0 = board.indexOf(0);
  for (let iter = 0; iter < 200; iter++) {
    const t = search(0, bound, blank0, -1);
    if (t === FOUND) return { states: path, moves, tileMoves };
    if (t === -2 || t === Infinity || t < 0) return null;
    bound = t;
  }
  return null;
}

// ---------- Sumplete ----------
export type SumpleteSolution = boolean[][]; // true = keep (circled), false = cancel (crossed out)

export function sumpleteSolve(
  grid: number[][],
  rowSums: number[],
  colSums: number[],
  maxSolutions = 50,
): SumpleteSolution[] {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const solutions: SumpleteSolution[] = [];
  const selection: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  // running column sums of kept cells, and max remaining addable per column
  const colRunning = Array(cols).fill(0);
  const colRemainingPos: number[] = Array(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) if (grid[r][c] > 0) colRemainingPos[c] += grid[r][c];
  }
  const colRemainingNeg: number[] = Array(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) if (grid[r][c] < 0) colRemainingNeg[c] += grid[r][c];
  }

  const rowMaxPos: number[] = grid.map((row) => row.reduce((a, v) => a + (v > 0 ? v : 0), 0));
  const rowMinNeg: number[] = grid.map((row) => row.reduce((a, v) => a + (v < 0 ? v : 0), 0));

  const backtrack = (r: number, c: number, rowSum: number, rowPosLeft: number, rowNegLeft: number) => {
    if (solutions.length >= maxSolutions) return;
    if (r === rows) {
      for (let j = 0; j < cols; j++) if (colRunning[j] !== colSums[j]) return;
      solutions.push(selection.map((row) => row.slice()));
      return;
    }
    if (c === cols) {
      if (rowSum !== rowSums[r]) return;
      backtrack(r + 1, 0, 0, rowMaxPos[r + 1] ?? 0, rowMinNeg[r + 1] ?? 0);
      return;
    }
    const v = grid[r][c];
    // prune: can this row still reach its target?
    if (rowSum + rowPosLeft < rowSums[r] || rowSum + rowNegLeft > rowSums[r]) return;
    const nextPosLeft = rowPosLeft - (v > 0 ? v : 0);
    const nextNegLeft = rowNegLeft - (v < 0 ? v : 0);
    const posLeftCol = colRemainingPos[c] - (v > 0 ? v : 0);
    const negLeftCol = colRemainingNeg[c] - (v < 0 ? v : 0);

    // Option 1: keep
    selection[r][c] = true;
    colRunning[c] += v;
    colRemainingPos[c] = posLeftCol;
    colRemainingNeg[c] = negLeftCol;
    if (colRunning[c] + posLeftCol >= colSums[c] && colRunning[c] + negLeftCol <= colSums[c]) {
      backtrack(r, c + 1, rowSum + v, nextPosLeft, nextNegLeft);
    }
    colRunning[c] -= v;

    // Option 2: cancel
    selection[r][c] = false;
    if (colRunning[c] + posLeftCol >= colSums[c] && colRunning[c] + negLeftCol <= colSums[c]) {
      backtrack(r, c + 1, rowSum, nextPosLeft, nextNegLeft);
    }
    colRemainingPos[c] = posLeftCol + (v > 0 ? v : 0);
    colRemainingNeg[c] = negLeftCol + (v < 0 ? v : 0);
  };

  if (rows > 0 && cols > 0) backtrack(0, 0, 0, rowMaxPos[0], rowMinNeg[0]);
  return solutions;
}

// ---------- Rotato ----------
export type RotatoMove = { br: number; bc: number; clockwise: boolean };
export type RotatoResult = { states: number[][]; moves: RotatoMove[] };

type RotatoEntry = { move: RotatoMove | null; state: number[] };

const rtKey = (s: number[]) => s.join(",");

function rtSafeRotations(locked: Set<string>, n: number): RotatoMove[] {
  const out: RotatoMove[] = [];
  for (let br = 0; br < n - 1; br++) {
    for (let bc = 0; bc < n - 1; bc++) {
      if (
        !locked.has(`${br},${bc}`) &&
        !locked.has(`${br},${bc + 1}`) &&
        !locked.has(`${br + 1},${bc}`) &&
        !locked.has(`${br + 1},${bc + 1}`)
      ) {
        out.push({ br, bc, clockwise: true });
        out.push({ br, bc, clockwise: false });
      }
    }
  }
  return out;
}

export function rotatoApply(state: number[], n: number, br: number, bc: number, clockwise: boolean): number[] {
  const g = state.slice();
  const i00 = br * n + bc;
  const i01 = i00 + 1;
  const i10 = i00 + n;
  const i11 = i10 + 1;
  if (clockwise) {
    g[i00] = state[i10];
    g[i01] = state[i00];
    g[i11] = state[i01];
    g[i10] = state[i11];
  } else {
    g[i00] = state[i01];
    g[i01] = state[i11];
    g[i10] = state[i00];
    g[i11] = state[i10];
  }
  return g;
}

// Minimal binary heap for A*
class RtHeap {
  private a: { f: number; g: number; state: number[] }[] = [];
  push(item: { f: number; g: number; state: number[] }) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

function rtSolvePhaseAstar(
  start: number[],
  n: number,
  targets: Map<number, [number, number]>,
  locked: Set<string>,
  nodeCap: number
): { path: RotatoEntry[]; state: number[] } | null {
  const rotations = rtSafeRotations(locked, n);
  const heuristic = (s: number[]) => {
    let h = 0;
    for (let idx = 0; idx < s.length; idx++) {
      const t = targets.get(s[idx]);
      if (t) h += Math.abs(Math.floor(idx / n) - t[0]) + Math.abs((idx % n) - t[1]);
    }
    return h;
  };
  const isGoal = (s: number[]) => {
    for (const [val, [tr, tc]] of targets) if (s[tr * n + tc] !== val) return false;
    return true;
  };
  if (isGoal(start)) return { path: [], state: start };

  const heap = new RtHeap();
  heap.push({ f: heuristic(start), g: 0, state: start });
  const cameFrom = new Map<string, { prev: number[]; move: RotatoMove } | null>();
  cameFrom.set(rtKey(start), null);
  const bestG = new Map<string, number>([[rtKey(start), 0]]);
  let expanded = 0;

  while (heap.size > 0) {
    const cur = heap.pop()!;
    if (++expanded > nodeCap) return null;
    const curKey = rtKey(cur.state);
    if ((bestG.get(curKey) ?? Infinity) < cur.g) continue;
    if (isGoal(cur.state)) {
      const path: RotatoEntry[] = [];
      let k = curKey;
      let st = cur.state;
      for (;;) {
        const from = cameFrom.get(k);
        if (!from) break;
        path.push({ move: from.move, state: st });
        st = from.prev;
        k = rtKey(st);
      }
      path.reverse();
      return { path, state: cur.state };
    }
    for (const rot of rotations) {
      const next = rotatoApply(cur.state, n, rot.br, rot.bc, rot.clockwise);
      const nk = rtKey(next);
      const ng = cur.g + 1;
      if (ng < (bestG.get(nk) ?? Infinity)) {
        bestG.set(nk, ng);
        cameFrom.set(nk, { prev: cur.state, move: rot });
        heap.push({ f: ng + 2 * heuristic(next), g: ng, state: next });
      }
    }
  }
  return null;
}

function rtSolveFinalBfs(
  start: number[],
  n: number,
  targets: Map<number, [number, number]>,
  locked: Set<string>,
  nodeCap: number
): { path: RotatoEntry[]; state: number[] } | null {
  const rotations = rtSafeRotations(locked, n);
  const isGoal = (s: number[]) => {
    for (const [val, [tr, tc]] of targets) if (s[tr * n + tc] !== val) return false;
    return true;
  };
  if (isGoal(start)) return { path: [], state: start };
  const queue: number[][] = [start];
  const cameFrom = new Map<string, { prev: number[]; move: RotatoMove } | null>();
  cameFrom.set(rtKey(start), null);
  let head = 0;
  let visited = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (++visited > nodeCap) return null;
    if (isGoal(cur)) {
      const path: RotatoEntry[] = [];
      let st = cur;
      for (;;) {
        const from = cameFrom.get(rtKey(st));
        if (!from) break;
        path.push({ move: from.move, state: st });
        st = from.prev;
      }
      path.reverse();
      return { path, state: cur };
    }
    for (const rot of rotations) {
      const next = rotatoApply(cur, n, rot.br, rot.bc, rot.clockwise);
      const nk = rtKey(next);
      if (!cameFrom.has(nk)) {
        cameFrom.set(nk, { prev: cur, move: rot });
        queue.push(next);
      }
    }
  }
  return null;
}

function rtPrune(seq: RotatoEntry[]): RotatoEntry[] {
  const seen = new Map<string, number>();
  const pruned: RotatoEntry[] = [];
  for (const entry of seq) {
    const k = rtKey(entry.state);
    if (seen.has(k)) {
      const idx = seen.get(k)!;
      pruned.length = idx + 1;
      seen.clear();
      pruned.forEach((e, i) => seen.set(rtKey(e.state), i));
    } else {
      pruned.push(entry);
      seen.set(k, pruned.length - 1);
    }
  }
  return pruned;
}

export function rotatoSolve(startGrid: number[], n: number, nodeCap = 2_000_000): RotatoResult | null {
  let state = startGrid.slice();
  const sequence: RotatoEntry[] = [{ move: null, state }];
  const locked = new Set<string>();
  let k = 0;

  while (n - k > 3) {
    // Top row k
    for (let c = k; c < n - 2; c++) {
      const val = k * n + c + 1;
      const res = rtSolvePhaseAstar(state, n, new Map([[val, [k, c] as [number, number]]]), locked, nodeCap);
      if (!res) return null;
      sequence.push(...res.path);
      state = res.state;
      locked.add(`${k},${c}`);
    }
    const valA = k * n + (n - 2) + 1;
    const valB = k * n + (n - 1) + 1;
    if (state[k * n + (n - 2)] === valA && state[k * n + (n - 1)] === valB) {
      locked.add(`${k},${n - 2}`);
      locked.add(`${k},${n - 1}`);
    } else {
      const res = rtSolvePhaseAstar(
        state,
        n,
        new Map([
          [valA, [k, n - 1] as [number, number]],
          [valB, [k + 1, n - 1] as [number, number]],
        ]),
        locked,
        nodeCap
      );
      if (!res) return null;
      sequence.push(...res.path);
      state = rotatoApply(res.state, n, k, n - 2, false);
      sequence.push({ move: { br: k, bc: n - 2, clockwise: false }, state });
      locked.add(`${k},${n - 2}`);
      locked.add(`${k},${n - 1}`);
    }

    // Left column k
    for (let r = k + 1; r < n - 2; r++) {
      const val = r * n + k + 1;
      const res = rtSolvePhaseAstar(state, n, new Map([[val, [r, k] as [number, number]]]), locked, nodeCap);
      if (!res) return null;
      sequence.push(...res.path);
      state = res.state;
      locked.add(`${r},${k}`);
    }
    const valC = (n - 2) * n + k + 1;
    const valD = (n - 1) * n + k + 1;
    if (state[(n - 2) * n + k] === valC && state[(n - 1) * n + k] === valD) {
      locked.add(`${n - 2},${k}`);
      locked.add(`${n - 1},${k}`);
    } else {
      const res = rtSolvePhaseAstar(
        state,
        n,
        new Map([
          [valC, [n - 1, k] as [number, number]],
          [valD, [n - 1, k + 1] as [number, number]],
        ]),
        locked,
        nodeCap
      );
      if (!res) return null;
      sequence.push(...res.path);
      state = rotatoApply(res.state, n, n - 2, k, true);
      sequence.push({ move: { br: n - 2, bc: k, clockwise: true }, state });
      locked.add(`${n - 2},${k}`);
      locked.add(`${n - 1},${k}`);
    }
    k += 1;
  }

  const finalTargets = new Map<number, [number, number]>();
  for (let r = k; r < n; r++) for (let c = k; c < n; c++) finalTargets.set(r * n + c + 1, [r, c]);
  const res = rtSolveFinalBfs(state, n, finalTargets, locked, nodeCap);
  if (!res) return null;
  sequence.push(...res.path);

  const optimized = rtPrune(sequence);
  return {
    states: optimized.map((e) => e.state),
    moves: optimized.slice(1).map((e) => e.move!),
  };
}

// ---------------------------------------------------------------------------
// Blunderwall: expected-guess-minimising decision tree analysis
// ---------------------------------------------------------------------------

export type BlunderwallStart = {
  word: string;
  avg: number;
  guaranteed: boolean;
};

export type BlunderwallAnalysis = {
  starts: BlunderwallStart[];
  best: string[];
};

const bwMatch = (guess: string, secret: string): number => {
  let n = 0;
  for (let i = 0; i < guess.length; i++) if (guess[i] === secret[i]) n++;
  return n;
};

type BwNode = { guess: string; avg: number };

class BwEngine {
  private memo = new Map<string, BwNode | null>();
  constructor(private words: string[]) {}

  /** Best next guess for `pool` with `attemptsLeft` guesses remaining (after this one there are attemptsLeft-1). */
  solve(pool: string[], attemptsLeft: number): BwNode | null {
    if (pool.length === 0) return null;
    if (pool.length === 1) return { guess: pool[0], avg: 1 };
    if (attemptsLeft <= 0) return null;
    const key = `${attemptsLeft}|${pool.join(",")}`;
    const cached = this.memo.get(key);
    if (cached !== undefined) return cached;
    let best: BwNode | null = null;
    for (const guess of this.words) {
      const buckets = new Map<number, string[]>();
      for (const secret of pool) {
        const score = bwMatch(guess, secret);
        const arr = buckets.get(score);
        if (arr) arr.push(secret);
        else buckets.set(score, [secret]);
      }
      if (buckets.size === 1 && !pool.includes(guess)) continue;
      let sum = 0;
      let ok = true;
      for (const [score, sub] of buckets) {
        if (score === guess.length) {
          sum += 1;
          continue;
        }
        const child = this.solve(sub, attemptsLeft - 1);
        if (!child) {
          ok = false;
          break;
        }
        sum += sub.length * (child.avg + 1);
      }
      if (!ok) continue;
      const avg = sum / pool.length;
      if (!best || avg < best.avg) best = { guess, avg };
    }
    this.memo.set(key, best);
    return best;
  }

  /** Expected guesses when the first guess is forced to `start`. */
  evaluateStart(start: string, attemptsLeft: number): number | null {
    const pool = this.words;
    const buckets = new Map<number, string[]>();
    for (const secret of pool) {
      const score = bwMatch(start, secret);
      const arr = buckets.get(score);
      if (arr) arr.push(secret);
      else buckets.set(score, [secret]);
    }
    let sum = 0;
    for (const [score, sub] of buckets) {
      if (score === start.length) {
        sum += 1;
        continue;
      }
      const child = this.solve(sub, attemptsLeft - 1);
      if (!child) return null;
      sum += sub.length * (child.avg + 1);
    }
    return sum / pool.length;
  }
}

/** Analyse every candidate starting word over the full word set. */
export function blunderwallAnalyze(words: string[], maxGuesses = 4): BlunderwallAnalysis {
  const engine = new BwEngine(words);
  const loose = new BwEngine(words);
  const starts: BlunderwallStart[] = [];
  for (const w of words) {
    const strict = engine.evaluateStart(w, maxGuesses);
    if (strict !== null) {
      starts.push({ word: w, avg: strict, guaranteed: true });
    } else {
      const relaxed = loose.evaluateStart(w, words.length + 1);
      starts.push({ word: w, avg: relaxed ?? Infinity, guaranteed: false });
    }
  }
  starts.sort((a, b) => (a.guaranteed === b.guaranteed ? a.avg - b.avg : a.guaranteed ? -1 : 1));
  const guaranteed = starts.filter((s) => s.guaranteed);
  const bestAvg = guaranteed.length ? guaranteed[0].avg : starts.length ? starts[0].avg : 0;
  const best = (guaranteed.length ? guaranteed : starts)
    .filter((s) => Math.abs(s.avg - bestAvg) < 1e-9)
    .map((s) => s.word);
  return { starts, best };
}

/** Recommended next guess given the remaining candidate pool. */
export function blunderwallNextGuess(
  words: string[],
  pool: string[],
  attemptsLeft: number,
): { guess: string; avg: number; guaranteed: boolean } | null {
  const engine = new BwEngine(words);
  const strict = engine.solve(pool, Math.max(1, attemptsLeft));
  if (strict) return { guess: strict.guess, avg: strict.avg, guaranteed: true };
  const loose = new BwEngine(words).solve(pool, words.length + 1);
  if (!loose) return null;
  return { guess: loose.guess, avg: loose.avg, guaranteed: false };
}
