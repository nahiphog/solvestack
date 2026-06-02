import graph from "@/data/wordLadder4.json";

type Graph = Record<string, string[]>;
const G = graph as Graph;

export function isValidWord(w: string): boolean {
  return Object.prototype.hasOwnProperty.call(G, w.toUpperCase());
}

export function findAllShortestPaths(start: string, goal: string): string[][] {
  const s = start.toUpperCase();
  const g = goal.toUpperCase();
  if (!isValidWord(s) || !isValidWord(g)) return [];
  if (s === g) return [[s]];

  // BFS level-by-level tracking parents for all shortest paths
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

  // Reconstruct all paths from g back to s
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
