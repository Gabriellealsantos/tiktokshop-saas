import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/criar-do-zero")({
  component: () => <Outlet />,
});
