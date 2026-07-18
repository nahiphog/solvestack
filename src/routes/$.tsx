import { createFileRoute } from "@tanstack/react-router";
import { Route as IndexRoute } from "./index";

export const Route = createFileRoute("/$")({
  component: IndexRoute.options.component!,
  head: IndexRoute.options.head,
});
