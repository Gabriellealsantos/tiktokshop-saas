import { createFileRoute } from "@tanstack/react-router";
import { AvatarStudio } from "@/features/avatars/studio";

export const Route = createFileRoute("/create-avatar")({
  component: AvatarStudio,
});
