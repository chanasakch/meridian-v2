import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import type { Patient, PayerType, RiskLevel } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { formatCurrency } from "../../utils/format";
import { RiskBadge, Badge } from "../ui/Badge";
import { Card, CardHeader } from "../ui/Card";

const RISK_FILTERS: (RiskLevel | "All")[] = ["All", "High", "Medium", "Low"];
const PAYER_FILTERS: (PayerType | "All")[] = ["All", "Commercial", "Medicare", "Medicaid", "Self-Pay"];

const RISK_FILTER_ACTIVE_CLASS: Record<RiskLevel | "All", string> = {
  All: "bg-brand text-brand-foreground",
  High: "bg-rose-600 text-white",
  Medium: "bg-amber-500 text-white",
  Low: "bg-brand text-brand-foreground",
};

export function ScheduleTable({
  patients,
  onSelectPatient,
}: {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<(RiskLevel | "All")>("All");
  const [payerFilter, setPayerFilter] = useState<(PayerType | "All")>("All");

  const rows = useMemo(() => {
    return patients
      .map((patient) => ({ patient, risk: computeRiskBreakdown(patient) }))
      .filter(({ patient }) => patient.name.toLowerCase().includes(query.toLowerCase()))
      .filter(({ risk }) => riskFilter === "All" || risk.level === riskFilter)
      .filter(({ patient }) => payerFilter === "All" || patient.payerType === payerFilter)
      .sort((a, b) => b.risk.score - a.risk.score);
  }, [patients, query, riskFilter, payerFilter]);

  return (
    <Card>
      <CardHeader
        title="Patient Schedule"
        subtitle={`${rows.length} of ${patients.length} appointments`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient…"
              className="w-48 rounded-lg bg-muted py-2 pl-9 pr-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-64"
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-start gap-x-5 gap-y-2 border-b border-border px-5 py-3">
        <FilterGroup label="Risk" options={RISK_FILTERS} active={riskFilter} onChange={setRiskFilter} activeClassFor={(opt) => RISK_FILTER_ACTIVE_CLASS[opt]} />
        <FilterGroup label="Payer" options={PAYER_FILTERS} active={payerFilter} onChange={setPayerFilter} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium">Lead Time</th>
              <th className="px-3 py-3 font-medium">Distance</th>
              <th className="px-3 py-3 font-medium">Payer</th>
              <th className="px-3 py-3 font-medium">Value</th>
              <th className="px-3 py-3 font-medium">Risk</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No appointments match the current filters.
                </td>
              </tr>
            )}
            {rows.map(({ patient, risk }) => (
              <tr
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent"
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.visitReason}</p>
                </td>
                <td className="px-3 py-3 text-foreground">{patient.appointmentTime}</td>
                <td className="px-3 py-3 text-foreground">{patient.leadTimeDays}d</td>
                <td className="px-3 py-3 text-foreground">{patient.distanceMiles.toFixed(1)} mi</td>
                <td className="px-3 py-3">
                  <Badge>{patient.payerType}</Badge>
                </td>
                <td className="px-3 py-3 text-foreground">{formatCurrency(patient.appointmentValue)}</td>
                <td className="px-3 py-3">
                  <RiskBadge level={risk.level} score={risk.score} />
                </td>
                <td className="px-3 py-3 text-muted-foreground/60">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onChange,
  activeClassFor,
}: {
  label: string;
  options: readonly T[];
  active: T;
  onChange: (value: T) => void;
  activeClassFor?: (option: T) => string;
}) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="pt-1 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              opt === active ? (activeClassFor?.(opt) ?? "bg-brand text-brand-foreground") : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
