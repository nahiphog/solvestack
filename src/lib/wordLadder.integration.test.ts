import { describe, expect, it } from "vitest";
import { findAllShortestPaths, isValidWord, type Mode } from "./wordLadder";

// No mocks: verify mode selection and loading of the shipped dictionaries.
const examples: [Mode, string, string][] = [
  [4, "AAHS", "DAHS"],
  [5, "AAHED", "ACHED"],
  [6, "AAHING", "ACHING"],
  ["splice", "AAHED", "EDEMA"],
  ["weaverx", "AAH", "AMAH"],
  ["pivots", "123456", "432156"],
  ["craftwords", "AAH", "AMAH"],
];

describe("word ladders with bundled data", () => {
  it.each(examples)("solves a direct edge in mode %s (%s to %s)", (mode, start, goal) => {
    expect(isValidWord(start.toLowerCase(), mode)).toBe(true);
    expect(isValidWord(goal, mode)).toBe(true);
    expect(findAllShortestPaths(start.toLowerCase(), goal, mode)).toEqual([[start, goal]]);
  });

  it("validates words against the selected dictionary", () => {
    expect(isValidWord("AAHS", 4)).toBe(true);
    expect(isValidWord("AAHS", 5)).toBe(false);
    expect(isValidWord("AAHED", 6)).toBe(false);
    expect(findAllShortestPaths("AAHS", "DAHS", 5)).toEqual([]);
  });
});
