import { ArrowDownRight, ArrowUpRight, CalendarClock, DollarSign, Target, TrendingDown } from "lucide-react";
import type { Patient } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { formatCurrency, formatPercent, mockTrend } from "../../utils/format";
import { Card } from "../ui/Card";

const RECOVERY_FACTOR = 0.35;

function useKpis(patients: Patient[]) {
  const scores = patients.map((p) => computeRiskBreakdown(p).score);
  const totalScheduled = patients.length;
  const avgNoShowRate = totalScheduled === 0 ? 0 : scores.reduce((sum, s) => sum + s, 0) / totalScheduled;
  const recoverableRevenue = patients.reduce((sum, p, i) => sum + (scores[i] / 100) * p.appointmentValue * RECOVERY_FACTOR, 0);
  return { totalScheduled, avgNoShowRate, recoverableRevenue };
}

export function KpiScorecard({ patients }: { patients: Patient[] }) {
  const { totalScheduled, avgNoShowRate, recoverableRevenue } = useKpis(patients);
  const highRiskCount = patients.filter((p) => computeRiskBreakdown(p).level === "High").length;
  const newPatientCount = patients.filter((p) => p.appointmentType === "New Patient").length;

  const cards = [
    {
      label: "Scheduled",
      value: totalScheduled.toString(),
      caption: `${newPatientCount} new patients`,
      icon: CalendarClock,
      trend: mockTrend("scheduled"),
      goodDirection: "up" as const,
    },
    {
      label: "No-Show Rate",
      value: formatPercent(avgNoShowRate),
      caption: `${highRiskCount} high-risk`,
      icon: TrendingDown,
      trend: mockTrend("noshow"),
      goodDirection: "down" as const,
    },
    {
      label: "Recoverable Revenue",
      value: formatCurrency(recoverableRevenue),
      caption: "via intervention",
      icon: DollarSign,
      trend: mockTrend("revenue"),
      goodDirection: "up" as const,
    },
    {
      label: "Precision / Recall",
      value: "0.83 / 0.79",
      caption: "F1 0.81 · AUC 0.89",
      icon: Target,
      trend: mockTrend("model"),
      goodDirection: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const trendUp = card.trend >= 0;
        const isFavorable = card.goodDirection === "up" ? trendUp : !trendUp;
        const TrendIcon = trendUp ? ArrowUpRight : ArrowDownRight;
        return (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <card.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-card-foreground">{card.value}</span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  isFavorable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(card.trend).toFixed(1)}%
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{card.caption} · vs last week</p>
          </Card>
        );
      })}
    </div>
  );
}
