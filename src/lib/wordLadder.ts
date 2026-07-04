import graph4 from "@/data/wordLadder4.json";
import graph5 from "@/data/wordLadder5.json";
import graph6 from "@/data/wordLadder6.json";
import graphSplice from "@/data/wordSplice.json";
import graphWeaverX from "@/data/wordWeaverX.json";
import graphPivots from "@/data/wordPivots.json";
import graphCraftWords from "@/data/wordCraftWords.json";



type Graph = Record<string, string[]>;

export type Mode = 4 | 5 | 6 | "splice" | "weaverx" | "pivots" | "wordiply" | "wordle" | "fibble" | "spellingbee" | "craftwords" | "mastermind" | "marbless" | "dodeku" | "wordpeaks" | "flippingletters" | "worwordle" | "sheetdoku" | "jeffgoldblum" | "sudoku" | "sudokuvariation" | "shuntle" | "splitle" | "blunderwall" | "doubledabble" | "wrdl";
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
  shuntle: 7,
  splitle: 5,
  blunderwall: 7,
  doubledabble: 5,
  wrdl: 5,
  
  
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
  const mod = await import("@/data/wrdlWords.json");
  _wrdlWordsCache = mod.default as Record<string, string[]>;
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
