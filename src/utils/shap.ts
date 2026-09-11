import type {
  AppointmentType,
  FeatureContribution,
  PayerType,
  PredictionFeatures,
  ReminderStatus,
  RiskBreakdown,
  RiskLevel,
  WeatherRisk,
} from "../types";

/**
 * Deterministic, client-side "explainable risk" engine.
 * Every feature maps to a signed point contribution (percentage points of
 * no-show probability). The same function backs both the mock dataset
 * generator and the live sandbox, so a slider move and a real schedule row
 * are always scored identically — single source of truth for the model.
 */

const BASELINE = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function leadTimeContribution(days: number): { points: number; detail: string } {
  const points = clamp((days - 5) * 0.68, -6, 30);
  const detail =
    days <= 3
      ? `${days} day${days === 1 ? "" : "s"} out — booked last-minute`
      : `${days} days out`;
  return { points, detail };
}

function distanceContribution(miles: number): { points: number; detail: string } {
  const points = clamp((miles - 3) * 0.58, -3, 16);
  return { points, detail: `${miles.toFixed(1)} mi from clinic` };
}

function priorNoShowContribution(count: number): { points: number; detail: string } {
  const points = clamp(count * 8, 0, 34);
  return {
    points,
    detail: count === 0 ? "Clean attendance history" : `${count} prior no-show${count === 1 ? "" : "s"} on file`,
  };
}

const PAYER_POINTS: Record<PayerType, number> = {
  Commercial: -4,
  Medicare: -1,
  Medicaid: 5,
  "Self-Pay": 9,
};

const PAYER_DETAIL: Record<PayerType, string> = {
  Commercial: "Low administrative friction",
  Medicare: "Established coverage, routine scheduling",
  Medicaid: "Transportation/scheduling barriers common",
  "Self-Pay": "Cost-sensitive — elevated cancellation pattern",
};

function payerContribution(payer: PayerType) {
  return { points: PAYER_POINTS[payer], detail: PAYER_DETAIL[payer] };
}

const REMINDER_POINTS: Record<ReminderStatus, number> = {
  "None Sent": 10,
  "SMS Sent": 2,
  Confirmed: -15,
};

const REMINDER_DETAIL: Record<ReminderStatus, string> = {
  "None Sent": "No outreach yet — highest-leverage gap",
  "SMS Sent": "Reminder delivered, awaiting reply",
  Confirmed: "Patient confirmed via SMS",
};

function reminderContribution(status: ReminderStatus) {
  return { points: REMINDER_POINTS[status], detail: REMINDER_DETAIL[status] };
}

const WEATHER_POINTS: Record<WeatherRisk, number> = {
  Low: -1,
  Moderate: 4,
  Severe: 11,
};

function weatherContribution(risk: WeatherRisk) {
  return { points: WEATHER_POINTS[risk], detail: `${risk} conditions forecast on appointment day` };
}

const APPT_TYPE_POINTS: Record<AppointmentType, number> = {
  "New Patient": 6,
  "Established Patient": -2,
};

function appointmentTypeContribution(type: AppointmentType) {
  return {
    points: APPT_TYPE_POINTS[type],
    detail: type === "New Patient" ? "No prior relationship with clinic" : "Established relationship with clinic",
  };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score < 30) return "Low";
  if (score < 60) return "Medium";
  return "High";
}

export function computeRiskBreakdown(features: PredictionFeatures): RiskBreakdown {
  const leadTime = leadTimeContribution(features.leadTimeDays);
  const distance = distanceContribution(features.distanceMiles);
  const priorNoShows = priorNoShowContribution(features.priorNoShows);
  const payer = payerContribution(features.payerType);
  const reminder = reminderContribution(features.reminderStatus);
  const weather = weatherContribution(features.weatherRisk);
  const apptType = appointmentTypeContribution(features.appointmentType);

  const rawContributions: FeatureContribution[] = [
    { key: "leadTimeDays", label: "Lead Time", detail: leadTime.detail, points: leadTime.points },
    { key: "priorNoShows", label: "Prior No-Shows", detail: priorNoShows.detail, points: priorNoShows.points },
    { key: "reminderStatus", label: "Reminder Status", detail: reminder.detail, points: reminder.points },
    { key: "distanceMiles", label: "Distance to Clinic", detail: distance.detail, points: distance.points },
    { key: "payerType", label: "Payer Type", detail: payer.detail, points: payer.points },
    { key: "weatherRisk", label: "Weather Risk", detail: weather.detail, points: weather.points },
    { key: "appointmentType", label: "Appointment Type", detail: apptType.detail, points: apptType.points },
  ];
  const contributions = rawContributions.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

  const rawScore = BASELINE + contributions.reduce((sum, c) => sum + c.points, 0);
  const score = Math.round(clamp(rawScore, 2, 97));

  return {
    baseline: BASELINE,
    score,
    level: scoreToLevel(score),
    contributions,
  };
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, { text: string; bg: string; ring: string; dot: string }> = {
  Low: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    ring: "ring-emerald-600/20 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
  },
  Medium: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/10",
    ring: "ring-amber-600/20 dark:ring-amber-400/30",
    dot: "bg-amber-500",
  },
  High: {
    text: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-500/10",
    ring: "ring-rose-600/20 dark:ring-rose-400/30",
    dot: "bg-rose-500",
  },
};
