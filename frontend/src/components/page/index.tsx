import type { ReactNode } from "react";
import { cn } from "@/utils/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn("mx-auto w-full max-w-375 px-4 pb-28 pt-4 md:px-7 lg:px-16 xl:px-28", className)}
    >
      {children}
    </main>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="entrance mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          typeof eyebrow === 'string' ? (
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-accent-300">
              {eyebrow}
            </p>
          ) : (
            <div className="mb-3">{eyebrow}</div>
          )
        )}
        <h1 className="text-3xl font-extrabold tracking-[-.035em] text-text-1 md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-2">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
export function SectionTitle({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold text-text-1">{title}</h2>
        </div>
        {description && <p className="mt-1 text-xs text-text-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}
