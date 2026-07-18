import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Solver Sanctuary" },
      { name: "description", content: "Find all shortest word ladders between two words." },
    ],
  }),
});

function RouteComponent() {
  const IndexModule = require("./index");
  const Comp = IndexModule.Route.options.component;
  return <Comp />;
}
