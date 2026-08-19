import { cn } from "@/utils/utils";
import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  // Campos de senha ganham automaticamente o botão de mostrar/ocultar.
  const isPassword = props.type === "password";
  const inputType = isPassword && showPassword ? "text" : props.type;

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text-2">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-deep/80 px-3.5 text-sm text-text-1 placeholder:text-text-3 focus:border-accent-400/50 focus:ring-4 focus:ring-accent-500/10",
            isPassword && "pr-11",
            props.className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-text-3 transition-colors hover:text-text-1"
          >
            <EyeOff className={cn("absolute size-4 transition-all duration-300", showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45")} />
            <Eye className={cn("absolute size-4 transition-all duration-300", !showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-45")} />
          </button>
        )}
      </div>
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
