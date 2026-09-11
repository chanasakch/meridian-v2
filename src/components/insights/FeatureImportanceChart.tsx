import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Patient } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { Card, CardHeader } from "../ui/Card";

interface ImportanceRow {
  label: string;
  avgImpact: number;
}

function useGlobalImportance(patients: Patient[]): ImportanceRow[] {
  return useMemo(() => {
    const totals = new Map<string, number>();
    patients.forEach((patient) => {
      const { contributions } = computeRiskBreakdown(patient);
      contributions.forEach((c) => {
        totals.set(c.label, (totals.get(c.label) ?? 0) + Math.abs(c.points));
      });
    });
    return Array.from(totals.entries())
      .map(([label, sum]) => ({ label, avgImpact: Math.round((sum / Math.max(patients.length, 1)) * 10) / 10 }))
      .sort((a, b) => b.avgImpact - a.avgImpact);
  }, [patients]);
}

export function FeatureImportanceChart({ patients }: { patients: Patient[] }) {
  const data = useGlobalImportance(patients);

  return (
    <Card>
      <CardHeader title="Feature Importance" subtitle={`Mean impact across ${patients.length} appointments`} />
      <div className="h-80 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="currentColor" className="text-border" />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={132}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-foreground"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value}% avg impact`, "Importance"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "rgba(128,128,128,0.08)" }}
            />
            <Bar dataKey="avgImpact" radius={4} maxBarSize={20} fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
