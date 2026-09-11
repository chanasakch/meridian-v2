import type { ReactNode } from "react";
import type { RiskLevel } from "../../types";

const RISK_STYLES: Record<RiskLevel, { text: string; bg: string; dot: string }> = {
  Low: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
  Medium: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  High: { text: "text-rose-700 dark:text-rose-400", bg: "bg-rose-500/10", dot: "bg-rose-500" },
};

/** Status is never color-only: every risk badge pairs a color dot with the level name and (optionally) the score. */
export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const style = RISK_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {level}
      {typeof score === "number" && <span className="opacity-70">· {score}%</span>}
    </span>
  );
}

/** A plain, neutral categorical tag — for informational (non-status) data like payer type. Deliberately colorless: color is reserved for the brand accent and semantic status only. */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}
