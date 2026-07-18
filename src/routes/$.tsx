import { createFileRoute } from "@tanstack/react-router";
import { Route as IndexRoute } from "./index";

export const Route = createFileRoute("/$")({
  component: IndexRoute.options.component!,
  head: () => ({
    meta: [
      { title: "Solver Sanctuary" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
});
