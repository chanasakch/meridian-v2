import { useMemo, useState } from "react";
import { PiggyBank, TrendingUp } from "lucide-react";
import type { Patient } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { formatCurrency } from "../../utils/format";
import { Card, CardHeader } from "../ui/Card";
import { Slider } from "../ui/Slider";

const BUSINESS_DAYS_PER_MONTH = 21;
const RECOVERY_RATE = 0.35;

export function RoiCalculator({ patients }: { patients: Patient[] }) {
  const [apptValue, setApptValue] = useState(160);

  const { grossMonthlyLoss, recoverableMonthly, monthlyNoShows } = useMemo(() => {
    if (patients.length === 0) {
      return { grossMonthlyLoss: 0, recoverableMonthly: 0, monthlyNoShows: 0 };
    }
    const avgNoShowRate = patients.reduce((sum, p) => sum + computeRiskBreakdown(p).score, 0) / patients.length / 100;
    const monthlyAppointments = patients.length * BUSINESS_DAYS_PER_MONTH;
    const monthlyNoShowsCalc = monthlyAppointments * avgNoShowRate;
    const grossLoss = monthlyNoShowsCalc * apptValue;
    return {
      grossMonthlyLoss: grossLoss,
      recoverableMonthly: grossLoss * RECOVERY_RATE,
      monthlyNoShows: Math.round(monthlyNoShowsCalc),
    };
  }, [patients, apptValue]);

  const recoveredPct = grossMonthlyLoss === 0 ? 0 : (recoverableMonthly / grossMonthlyLoss) * 100;

  return (
    <Card>
      <CardHeader title="ROI Calculator" subtitle="Projected monthly impact" />
      <div className="grid grid-cols-1 items-start gap-6 p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Slider
            label="Avg. Appointment Value"
            value={apptValue}
            min={50}
            max={400}
            step={5}
            unit="$"
            onChange={setApptValue}
            hint={`≈ ${monthlyNoShows.toLocaleString()} no-shows / mo`}
          />
          <p className="text-xs text-muted-foreground">Assumes a {(RECOVERY_RATE * 100).toFixed(0)}% intervention recovery rate.</p>
        </div>

        <div className="space-y-4">
          <StatRow icon={TrendingUp} label="Revenue at Risk / mo" value={formatCurrency(grossMonthlyLoss)} tone="rose" />
          <StatRow icon={PiggyBank} label="Recoverable / mo" value={formatCurrency(recoverableMonthly)} tone="emerald" />
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Recovered</span>
              <span>{recoveredPct.toFixed(0)}% of at-risk revenue</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-rose-500/10">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${recoveredPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatRow({ icon: Icon, label, value, tone }: { icon: typeof TrendingUp; label: string; value: string; tone: "rose" | "emerald" }) {
  const toneClasses = tone === "rose" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-border">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
