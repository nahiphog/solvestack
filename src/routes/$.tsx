import { createFileRoute } from "@tanstack/react-router";
import { Route as IndexRoute } from "./index";

const IndexComponent = IndexRoute.options.component as React.ComponentType;

export const Route = createFileRoute("/$")({
  component: IndexComponent,
  head: () => ({
    meta: [
      { title: "Solver Sanctuary" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
});
