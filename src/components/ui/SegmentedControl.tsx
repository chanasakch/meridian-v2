import { useId } from "react";
import { motion } from "framer-motion";

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({ value, options, onChange, fullWidth = false }: SegmentedControlProps<T>) {
  const groupId = useId();

  return (
    <div role="radiogroup" className={`inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5 ${fullWidth ? "w-full" : ""}`}>
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={`relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${fullWidth ? "flex-1" : ""} ${
              active ? "text-card-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${groupId}-indicator`}
                className="absolute inset-0 rounded-md bg-card ring-1 ring-border"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
