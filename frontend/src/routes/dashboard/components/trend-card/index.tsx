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
    <div className="glass-surface p-6 overflow-hidden">
      <Icon className="size-5 text-accent-300" />
      <h3 className="mt-5 font-bold wrap-break-word">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-2 wrap-break-word">{text}</p>
    </div>
  );
}
