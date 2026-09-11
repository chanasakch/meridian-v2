import type { CSSProperties } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  hint?: string;
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange, hint }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const trackStyle = { "--slider-percent": `${percent}%` } as CSSProperties;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold tabular-nums text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={trackStyle}
        className="w-full cursor-pointer"
        aria-label={label}
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {min}
          {unit} – {max}
          {unit}
        </span>
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
