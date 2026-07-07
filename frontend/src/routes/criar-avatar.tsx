import { createFileRoute } from "@tanstack/react-router";
import { AvatarStudio } from "@/features/avatars/avatar-studio";

export const Route = createFileRoute("/criar-avatar")({
  component: AvatarStudio,
});
