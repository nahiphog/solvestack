import { createFileRoute } from "@tanstack/react-router";
import { Route as IndexRoute } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IndexComponent: any = IndexRoute.options.component;

export const Route = createFileRoute("/$")({
  component: IndexComponent,
  head: () => ({
    meta: [
      { title: "Solver Sanctuary" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
});
