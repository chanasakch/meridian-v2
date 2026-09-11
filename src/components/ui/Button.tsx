import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "default" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  default: "bg-brand text-brand-foreground hover:bg-brand/90",
  outline: "border border-border bg-card text-foreground hover:bg-accent",
  secondary: "bg-muted text-foreground hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-rose-600 text-white hover:bg-rose-600/90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  default: "h-8 px-3.5 text-sm gap-2",
  lg: "h-9 px-4 text-sm gap-2",
  icon: "h-8 w-8 shrink-0 justify-center",
};

export function Button({
  variant = "default",
  size = "default",
  icon,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center rounded-lg font-medium transition-colors active:translate-y-px disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
