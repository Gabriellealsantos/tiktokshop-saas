import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/trend-boost/$template")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
