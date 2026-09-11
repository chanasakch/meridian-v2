import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Resting-surface elevation is a 1px ring, never a shadow — shadows are reserved for floating surfaces (sheets, dropdowns, toasts). */
export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div className={`rounded-xl bg-card ring-1 ring-border ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
