import { useState } from "react";
import { Check, MapPin, MessageSquareText, Video, X as XIcon, Layers, CalendarClock, CreditCard } from "lucide-react";
import type { Patient } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { formatCurrency } from "../../utils/format";
import { Sheet } from "../ui/Sheet";
import { RiskBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ShapAttributionChart } from "./ShapAttributionChart";
import { useToast } from "../../hooks/useToast";

export function ExplainabilityDrawer({
  patient,
  onClose,
  onUpdatePatient,
}: {
  patient: Patient | null;
  onClose: () => void;
  onUpdatePatient: (patientId: string, updates: Partial<Patient>) => void;
}) {
  const { pushToast } = useToast();

  // Keep rendering the last-open patient's content while the panel's close
  // transition plays, so it doesn't go blank mid-animation. Synced during
  // render (React's documented pattern) rather than in an effect, since
  // deriving it there would cost an extra render pass.
  const [displayPatient, setDisplayPatient] = useState<Patient | null>(patient);
  if (patient && patient !== displayPatient) {
    setDisplayPatient(patient);
  }

  const active = displayPatient;

  const logIntervention = (p: Patient, type: Patient["interventions"][number]["type"], label: string) => {
    onUpdatePatient(p.id, { interventions: [...p.interventions, { type, label, timestamp: Date.now() }] });
  };

  const handleSms = (p: Patient) => {
    if (p.reminderStatus === "Confirmed") {
      pushToast({ title: "Already confirmed", description: "Patient has already confirmed this visit.", variant: "info" });
      return;
    }
    onUpdatePatient(p.id, { reminderStatus: "SMS Sent" });
    logIntervention(p, "sms", "SMS reminder sent");
    pushToast({ title: "Reminder sent", description: `${p.name} — risk score recalculated.`, variant: "success" });
  };

  const handleTelehealth = (p: Patient) => {
    onUpdatePatient(p.id, { distanceMiles: 0, weatherRisk: "Low" });
    logIntervention(p, "telehealth", "Converted to telehealth");
    pushToast({ title: "Converted to telehealth", description: "Distance and weather risk cleared.", variant: "success" });
  };

  const handleOverbook = (p: Patient) => {
    logIntervention(p, "overbook", "Flagged for overbook");
    pushToast({ title: "Overbook flagged", description: "Scheduling team notified.", variant: "warning" });
  };

  const risk = active ? computeRiskBreakdown(active) : null;
  const attendanceRate = active
    ? Math.round((active.historicalAttendance.filter(Boolean).length / active.historicalAttendance.length) * 100)
    : 0;

  return (
    <Sheet
      open={!!patient}
      onClose={onClose}
      side="right"
      widthClassName="w-full max-w-xl"
      title={active?.name ?? ""}
      subtitle={active ? `${active.visitReason} · ${active.appointmentTime} · ${active.provider}` : undefined}
    >
      {active && risk && (
        <div className="space-y-6 px-6 py-5">
          <section className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Predicted Probability</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{risk.score}%</p>
            </div>
            <RiskBadge level={risk.level} />
          </section>

          <section className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <ProfileStat icon={CalendarClock} label="Lead Time" value={`${active.leadTimeDays}d`} />
            <ProfileStat icon={MapPin} label="Distance" value={`${active.distanceMiles.toFixed(1)} mi`} />
            <ProfileStat icon={CreditCard} label="Payer" value={active.payerType} />
            <ProfileStat icon={Layers} label="Value" value={formatCurrency(active.appointmentValue)} />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Attendance History</h3>
            <div className="flex items-center gap-2">
              {active.historicalAttendance.map((attended, i) => (
                <span
                  key={i}
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    attended ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                  title={attended ? "Attended" : "No-show"}
                >
                  {attended ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                </span>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">{attendanceRate}% attended</span>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-foreground">SHAP Attribution</h3>
              <span className="text-xs text-muted-foreground">vs. {risk.baseline}% baseline</span>
            </div>
            <ShapAttributionChart contributions={risk.contributions} />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Interventions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={<MessageSquareText className="h-4 w-4" />} onClick={() => handleSms(active)}>
                Send SMS Reminder
              </Button>
              <Button variant="outline" size="sm" icon={<Video className="h-4 w-4" />} onClick={() => handleTelehealth(active)}>
                Convert to Telehealth
              </Button>
              <Button variant="outline" size="sm" icon={<Layers className="h-4 w-4" />} onClick={() => handleOverbook(active)}>
                Flag Overbook
              </Button>
            </div>
            {active.interventions.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {active.interventions.map((entry, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brand" />
                    {entry.label} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-lg p-3 ring-1 ring-border">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
