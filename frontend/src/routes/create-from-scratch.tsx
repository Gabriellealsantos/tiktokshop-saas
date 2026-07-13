import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/create-from-scratch")({
  component: () => <Outlet />,
});
