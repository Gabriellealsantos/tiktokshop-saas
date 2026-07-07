import { createFileRoute } from "@tanstack/react-router";
import { AvatarsList } from "@/features/avatars/avatars-list";

export const Route = createFileRoute("/avatares")({ component: AvatarsList });
