import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text-2">{label}</span>
      <input
        {...props}
        className={cn(
          "h-11 w-full rounded-[12px] border border-border bg-deep/80 px-3.5 text-sm text-text-1 placeholder:text-text-3 focus:border-accent-400/50 focus:ring-4 focus:ring-accent-500/10",
          props.className,
        )}
      />
      {hint && <span className="mt-1.5 block text-[11px] text-text-3">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text-2">{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-28 w-full resize-none rounded-[14px] border border-border bg-deep/80 p-3.5 text-sm leading-6 text-text-1 placeholder:text-text-3 focus:border-accent-400/50 focus:ring-4 focus:ring-accent-500/10",
          props.className,
        )}
      />
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  semantic = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  semantic?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm text-text-2"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full bg-surface-3 transition-colors",
          checked && (semantic ? "bg-success" : "brand-gradient"),
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 size-4 rounded-full bg-text-1 shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
