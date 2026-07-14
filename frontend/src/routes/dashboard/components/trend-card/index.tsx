import type { LucideIcon } from "lucide-react";

export function Trend({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-surface p-6">
      <Icon className="size-5 text-accent-300" />
      <h3 className="mt-5 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-2">{text}</p>
    </div>
  );
}
