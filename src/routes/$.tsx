import { createFileRoute } from "@tanstack/react-router";
import { Route as IndexRoute } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IndexComponent: any = IndexRoute.options.component;

export const Route = createFileRoute("/$")({
  component: IndexComponent,
  head: () => ({
    meta: [
      { title: "Solver Sanctuary — Word Game & Puzzle Solvers" },
      {
        name: "description",
        content:
          "Free solvers for Wordle, word ladders, Sudoku, Star Battle, the 15 puzzle and more.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});
