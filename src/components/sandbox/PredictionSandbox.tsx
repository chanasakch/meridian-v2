import { useMemo, useState, type ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import type { AppointmentType, Patient, PayerType, PredictionFeatures, ReminderStatus, WeatherRisk } from "../../types";
import { computeRiskBreakdown, RISK_LEVEL_COLORS } from "../../utils/shap";
import { Card, CardHeader } from "../ui/Card";
import { Slider } from "../ui/Slider";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Button } from "../ui/Button";
import { RiskBadge } from "../ui/Badge";
import { ShapAttributionChart } from "../dashboard/ShapAttributionChart";

const PAYER_OPTIONS: PayerType[] = ["Commercial", "Medicare", "Medicaid", "Self-Pay"];
const REMINDER_OPTIONS: ReminderStatus[] = ["None Sent", "SMS Sent", "Confirmed"];
const WEATHER_OPTIONS: WeatherRisk[] = ["Low", "Moderate", "Severe"];
const APPT_TYPE_OPTIONS: AppointmentType[] = ["New Patient", "Established Patient"];

const DEFAULT_FEATURES: PredictionFeatures = {
  leadTimeDays: 14,
  distanceMiles: 8,
  priorNoShows: 1,
  payerType: "Commercial",
  reminderStatus: "SMS Sent",
  weatherRisk: "Low",
  appointmentType: "Established Patient",
};

export function PredictionSandbox({ patients }: { patients: Patient[] }) {
  const [features, setFeatures] = useState<PredictionFeatures>(DEFAULT_FEATURES);

  const risk = useMemo(() => computeRiskBreakdown(features), [features]);
  const colors = RISK_LEVEL_COLORS[risk.level];

  const update = <K extends keyof PredictionFeatures>(key: K, value: PredictionFeatures[K]) => {
    setFeatures((prev) => ({ ...prev, [key]: value }));
  };

  const loadRandomPatient = () => {
    if (patients.length === 0) return;
    const p = patients[Math.floor(Math.random() * patients.length)];
    setFeatures({
      leadTimeDays: p.leadTimeDays,
      distanceMiles: Math.round(p.distanceMiles),
      priorNoShows: p.priorNoShows,
      payerType: p.payerType,
      reminderStatus: p.reminderStatus,
      weatherRisk: p.weatherRisk,
      appointmentType: p.appointmentType,
    });
  };

  const gaugeData = [{ name: "risk", value: risk.score, fill: gaugeColor(risk.level) }];

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader
          title="Prediction Sandbox"
          subtitle="Adjust inputs to recompute risk"
          action={
            <Button variant="outline" size="sm" icon={<Shuffle className="h-4 w-4" />} onClick={loadRandomPatient}>
              Load Sample
            </Button>
          }
        />
        <div className="space-y-6 p-5">
          <Slider label="Lead Time" value={features.leadTimeDays} min={0} max={60} unit=" days" onChange={(v) => update("leadTimeDays", v)} />
          <Slider label="Distance to Clinic" value={features.distanceMiles} min={0} max={30} unit=" mi" onChange={(v) => update("distanceMiles", v)} />
          <Slider label="Prior No-Shows" value={features.priorNoShows} min={0} max={5} onChange={(v) => update("priorNoShows", v)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledControl label="Payer Type">
              <SegmentedControl fullWidth value={features.payerType} options={PAYER_OPTIONS} onChange={(v) => update("payerType", v)} />
            </LabeledControl>
            <LabeledControl label="Reminder Status">
              <SegmentedControl fullWidth value={features.reminderStatus} options={REMINDER_OPTIONS} onChange={(v) => update("reminderStatus", v)} />
            </LabeledControl>
            <LabeledControl label="Weather Risk">
              <SegmentedControl fullWidth value={features.weatherRisk} options={WEATHER_OPTIONS} onChange={(v) => update("weatherRisk", v)} />
            </LabeledControl>
            <LabeledControl label="Appointment Type">
              <SegmentedControl fullWidth value={features.appointmentType} options={APPT_TYPE_OPTIONS} onChange={(v) => update("appointmentType", v)} />
            </LabeledControl>
          </div>
        </div>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader title="Predicted Probability" />
        <div className="flex flex-col items-center gap-3 p-5">
          <div className="relative h-48 w-48">
            <RadialBarChart width={192} height={192} cx="50%" cy="50%" innerRadius="76%" outerRadius="100%" barSize={14} data={gaugeData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "rgba(128,128,128,0.16)" }} />
            </RadialBarChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold tracking-tight text-foreground">{risk.score}%</span>
              <span className="text-xs text-muted-foreground">no-show probability</span>
            </div>
          </div>
          <RiskBadge level={risk.level} />
        </div>
        <div className={`mx-5 mb-5 rounded-lg p-3 text-xs ${colors.bg} ${colors.text}`}>
          <p className="font-semibold">Recommended action</p>
          <p className="mt-1 opacity-90">{recommendationFor(risk.level)}</p>
        </div>
        <div className="px-5 pb-5">
          <ShapAttributionChart contributions={risk.contributions} />
        </div>
      </Card>
    </div>
  );
}

function LabeledControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function gaugeColor(level: "Low" | "Medium" | "High") {
  if (level === "Low") return "#10b981";
  if (level === "Medium") return "#f59e0b";
  return "#f43f5e";
}

function recommendationFor(level: "Low" | "Medium" | "High") {
  if (level === "Low") return "Standard reminder cadence is sufficient — no action needed.";
  if (level === "Medium") return "Send an SMS confirmation 48 hours ahead to reduce risk further.";
  return "High risk — recommend a live confirmation call and consider overbooking this slot.";
}
