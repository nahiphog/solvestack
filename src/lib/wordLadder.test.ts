import { describe, expect, it, vi } from "vitest";

// A cyclic graph with three shortest routes, a longer detour, and an
// isolated word. Explicit expected paths catch missing equal-depth parents.
vi.mock("@/data/wordLadder4.json", () => ({
  default: {
    COLD: ["CORD", "GOLD"],
    CORD: ["COLD", "CARD", "WORD"],
    CARD: ["CORD", "WARD"],
    WORD: ["CORD", "WARD", "WORM", "LORD"],
    WARD: ["CARD", "WORD", "WARM"],
    WORM: ["WORD", "WARM"],
    WARM: ["WARD", "WORM"],
    GOLD: ["COLD", "GOAD"],
    GOAD: ["GOLD", "LOAD"],
    LOAD: ["GOAD", "LORD"],
    LORD: ["LOAD", "WORD"],
    ZZZZ: [],
  },
}));

import { findAllShortestPaths, isValidWord } from "./wordLadder";

const shortest = [
  ["COLD", "CORD", "CARD", "WARD", "WARM"],
  ["COLD", "CORD", "WORD", "WARD", "WARM"],
  ["COLD", "CORD", "WORD", "WORM", "WARM"],
];

// Compare the full multiset without making traversal order part of the API.
const paths = (values: string[][]) => values.map((p) => p.join(" -> ")).sort();

describe("findAllShortestPaths", () => {
  it("returns every shortest path, without duplicates or longer routes", () => {
    expect(paths(findAllShortestPaths("COLD", "WARM", 4))).toEqual(paths(shortest));
  });

  it("normalizes mixed-case endpoints", () => {
    expect(paths(findAllShortestPaths("cold", "WaRm", 4))).toEqual(paths(shortest));
  });

  it("returns just the endpoints for adjacent words", () => {
    expect(findAllShortestPaths("COLD", "CORD", 4)).toEqual([["COLD", "CORD"]]);
  });

  it("returns a single word when valid endpoints are identical", () => {
    expect(findAllShortestPaths("cold", "COLD", 4)).toEqual([["COLD"]]);
    expect(findAllShortestPaths("ZZZZ", "ZZZZ", 4)).toEqual([["ZZZZ"]]);
  });

  it.each([
    ["NOPE", "WARM"],
    ["COLD", "NOPE"],
    ["NOPE", "NOPE"],
    ["", "WARM"],
    ["COLD", ""],
  ])("returns no paths for invalid endpoints %j and %j", (start, goal) => {
    expect(findAllShortestPaths(start, goal, 4)).toEqual([]);
  });

  it("terminates with no paths between disconnected valid words", () => {
    expect(findAllShortestPaths("COLD", "ZZZZ", 4)).toEqual([]);
    expect(findAllShortestPaths("ZZZZ", "COLD", 4)).toEqual([]);
  });

  it("removes only routes that use an excluded word", () => {
    expect(paths(findAllShortestPaths("COLD", "WARM", 4, ["CARD"]))).toEqual(
      paths(shortest.slice(1)),
    );
  });

  it("finds longer alternatives when all original shortest routes are blocked", () => {
    expect(paths(findAllShortestPaths("COLD", "WARM", 4, ["CORD"]))).toEqual(
      paths([
        ["COLD", "GOLD", "GOAD", "LOAD", "LORD", "WORD", "WARD", "WARM"],
        ["COLD", "GOLD", "GOAD", "LOAD", "LORD", "WORD", "WORM", "WARM"],
      ]),
    );
  });

  it("returns no paths when exclusions disconnect the endpoints", () => {
    expect(findAllShortestPaths("COLD", "WARM", 4, ["CORD", "GOLD"])).toEqual([]);
  });

  it("normalizes exclusions and ignores duplicates, blanks, and unknown words", () => {
    expect(
      paths(findAllShortestPaths("COLD", "WARM", 4, [" card ", "CARD", "", "  ", "NOPE"])),
    ).toEqual(paths(shortest.slice(1)));
  });

  it("does not exclude the start or goal", () => {
    expect(paths(findAllShortestPaths("COLD", "WARM", 4, [" cold ", "warm"]))).toEqual(
      paths(shortest),
    );
  });

  it("does not mutate the graph or caller's exclusions across solves", () => {
    const excluded = [" card "];
    findAllShortestPaths("COLD", "WARM", 4, excluded);
    expect(excluded).toEqual([" card "]);
    expect(isValidWord("CARD", 4)).toBe(true);
    expect(paths(findAllShortestPaths("COLD", "WARM", 4))).toEqual(paths(shortest));
  });
});

describe("isValidWord", () => {
  it("accepts graph members case-insensitively, including isolated words", () => {
    expect(isValidWord("cold", 4)).toBe(true);
    expect(isValidWord("ZZZZ", 4)).toBe(true);
  });

  it.each(["NOPE", "", "COLD ", "constructor", "__proto__"])(
    "rejects non-members such as %j",
    (word) => expect(isValidWord(word, 4)).toBe(false),
  );
});
