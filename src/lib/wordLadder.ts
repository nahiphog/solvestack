import graph4 from "@/data/wordLadder4.json";
import graph5 from "@/data/wordLadder5.json";
import graph6 from "@/data/wordLadder6.json";
import graph7 from "@/data/wordLadder7.json";
import graph8 from "@/data/wordLadder8.json";
import graph9 from "@/data/wordLadder9.json";
import graphSplice from "@/data/wordSplice.json";
import graphWeaverX from "@/data/wordWeaverX.json";
import graphPivots from "@/data/wordPivots.json";
import wordle5 from "@/data/wordle5.json";

type Graph = Record<string, string[]>;

export type Mode = 4 | 5 | 6 | 7 | 8 | 9 | "splice" | "weaverx" | "pivots" | "wordiply" | "wordle";
export type WordLength = Mode;

const GRAPHS: Record<string, Graph> = {
  "4": graph4 as Graph,
  "5": graph5 as Graph,
  "6": graph6 as Graph,
  "7": graph7 as Graph,
  "8": graph8 as Graph,
  "9": graph9 as Graph,
  splice: graphSplice as Graph,
  weaverx: graphWeaverX as Graph,
  pivots: graphPivots as Graph,
};

// 0 means variable length (no length validation)
export const MODE_WORD_LENGTH: Record<string, number> = {
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  splice: 5,
  weaverx: 0,
  pivots: 6,
  wordiply: 0,
  wordle: 5,
};


const FIVE_LETTER_WORDS = wordle5 as string[];

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

export function isValid5LetterWord(w: string): boolean {
  return FIVE_LETTER_WORDS.includes(w.toUpperCase());
}

export function wordleSolve(guesses: { word: string; pattern: WordleColor[] }[]): string[] {
  return FIVE_LETTER_WORDS.filter((answer) =>
    guesses.every((g) => {
      const out = wordleOutput(g.word, answer);
      for (let i = 0; i < out.length; i++) if (out[i] !== g.pattern[i]) return false;
      return true;
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

export function formatPivotsWord(curr: string, bracket: [number, number] | null): string {
  if (!bracket) return curr;
  const [start, end] = bracket;
  return curr.slice(0, start) + "(" + curr.slice(start, end + 1) + ")" + curr.slice(end + 1);
}

export function wordiplySearch(substring: string): [number, string[]][] {
  const sub = substring.toUpperCase();
  if (!sub) return [];
  const groups = new Map<number, string[]>();
  for (const w of ALL_ENGLISH_WORDS) {
    if (w.includes(sub)) {
      const extra = w.length - sub.length;
      if (!groups.has(extra)) groups.set(extra, []);
      groups.get(extra)!.push(w);
    }
  }
  return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
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
