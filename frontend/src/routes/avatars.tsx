import { createFileRoute } from "@tanstack/react-router";
import { AvatarsList } from "@/features/avatars";

export const Route = createFileRoute("/avatars")({ component: AvatarsList });
